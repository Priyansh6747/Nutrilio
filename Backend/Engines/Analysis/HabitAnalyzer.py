
import traceback
import pandas as pd
from datetime import date, timedelta, datetime
from typing import Dict, Any, Optional
import logging

# Import pipeline modules
from Engines.Analysis.DataExtractor import DataExtractor
from Engines.Analysis.FeatureBuilder import FeatureBuilder
from Engines.Analysis.ChronosModel import ChronosModel
from Engines.Analysis.InsightEngine import InsightEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def generate_habit_analysis_report(
    uid: str,
    start_days_ago: int = 60,
    context_length: int = 30,
    prediction_length: int = 7,
    num_samples: int = 20
) -> Dict[str, Any]:
    
    logger.info("="*80)
    logger.info(f"🚀 STARTING HABIT ANALYSIS PIPELINE")
    logger.info(f"User: {uid}")
    logger.info(f"Parameters: {start_days_ago}d history, {context_length}d context, {prediction_length}d forecast")
    logger.info("="*80)
    
    try:
        # ============================================================
        # STEP 1: DATE WINDOW SETUP
        # ============================================================
        logger.info("\n[STEP 1/5] Setting up date window...")
        end_date = date.today()
        start_date = end_date - timedelta(days=start_days_ago)
        logger.info(f"✓ Date range: {start_date} to {end_date}")
        
        # ============================================================
        # STEP 2: DATA EXTRACTION
        # ============================================================
        logger.info("\n[STEP 2/5] Extracting data from Firestore...")
        extractor = DataExtractor(uid)
        raw_data = extractor.build_raw_data(start_date, end_date)
        
        if not raw_data or len(raw_data) == 0:
            logger.warning(f"⚠ No data found for user {uid}")
            return {
                "status": "error",
                "username": uid,
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "error": "No habit data found for this user",
                "message": "User needs to log meals and habits first"
            }
        
        logger.info(f"✓ Loaded {len(raw_data)} days of data")
        
        # ============================================================
        # STEP 3: FEATURE ENGINEERING
        # ============================================================
        logger.info("\n[STEP 3/5] Building feature matrix...")
        
        # Build normalized features for Chronos
        builder_normalized = FeatureBuilder(normalize=True, window_days=7)
        context_tensor = builder_normalized.build_feature_matrix(
            raw_data, 
            context_length=context_length
        )
        logger.info(f"✓ Context tensor shape: {context_tensor.shape}")
        logger.info(f"✓ Features: {len(builder_normalized.feature_columns)}")
        
        # Build raw features for comparison
        builder_raw = FeatureBuilder(normalize=False, window_days=7)
        _ = builder_raw.build_feature_matrix(raw_data, context_length=context_length)
        recent_df = builder_raw.build_dataframe(raw_data)
        logger.info(f"✓ Recent dataframe: {len(recent_df)} days")
        
        # ============================================================
        # STEP 4: FORECAST GENERATION
        # ============================================================
        logger.info("\n[STEP 4/5] Generating forecasts with Chronos...")
        model = ChronosModel(
            prediction_length=prediction_length,
            num_samples=num_samples
        )
        
        forecast_result = model.get_forecast(
            context_tensor=context_tensor,
            feature_names=builder_normalized.feature_columns,
            norm_params=builder_normalized.norm_params,
            start_date=end_date
        )
        logger.info(f"✓ Forecast generated: {forecast_result['shape']}")
        
        # Convert forecast to DataFrame for InsightEngine
        forecast_df = pd.DataFrame(forecast_result['forecast'])
        forecast_df['date'] = pd.to_datetime(forecast_df['date'])
        forecast_df = forecast_df.set_index('date')
        logger.info(f"✓ Forecast dataframe: {len(forecast_df)} days")
        
        # ============================================================
        # STEP 5: INSIGHT GENERATION
        # ============================================================
        logger.info("\n[STEP 5/5] Generating insights...")
        
        # Define key features to focus on
        feature_focus = [
            'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
            'water_intake_ml', 'meal_count', 'current_streak'
        ]
        
        # Only include features that exist in the data
        available_features = [
            f for f in feature_focus 
            if f in forecast_df.columns and f in recent_df.columns
        ]
        
        insight_engine = InsightEngine(
            forecast_df=forecast_df,
            recent_df=recent_df,
            feature_focus=available_features,
            threshold_percent=5.0
        )
        
        report = insight_engine.build_report()
        logger.info(f"✓ Insights generated successfully")
        
        # ============================================================
        # STEP 6: PACKAGE RESULTS
        # ============================================================
        logger.info("\n[STEP 6/6] Packaging results...")
        
        # Add forecast data for visualization
        forecast_data = []
        for idx, row in forecast_df.iterrows():
            forecast_data.append({
                "date": idx.strftime("%Y-%m-%d"),
                **{col: round(float(row[col]), 2) for col in forecast_df.columns if col != 'date'}
            })
        
        result = {
            "status": "success",
            "username": uid,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "forecast_period": {
                "start": forecast_df.index[0].strftime("%Y-%m-%d"),
                "end": forecast_df.index[-1].strftime("%Y-%m-%d"),
                "days": len(forecast_df)
            },
            "summary": report.get("summary", ""),
            "overall_score": report.get("overall_score", {}),
            "macro_trends": report.get("macro_trends", []),
            "engagement": report.get("engagement", {}),
            "anomalies": report.get("anomalies", []),
            "risk_flags": report.get("risk_flags", []),
            "forecast_data": forecast_data,
            "forecast_summary": forecast_result.get("forecast_summary", {}),
            "metadata": {
                "context_length": context_length,
                "prediction_length": prediction_length,
                "num_samples": num_samples,
                "features_analyzed": len(available_features),
                "data_quality": {
                    "days_loaded": len(raw_data),
                    "days_with_data": len(recent_df),
                    "completeness": round(len(recent_df) / len(raw_data) * 100, 1)
                }
            }
        }
        
        logger.info("="*80)
        logger.info(f"✅ HABIT ANALYSIS COMPLETE")
        logger.info(f"Score: {result['overall_score']['score']}/100 ({result['overall_score']['grade']})")
        logger.info(f"Trends: {len(result['macro_trends'])} analyzed")
        logger.info(f"Risk Flags: {len(result['risk_flags'])}")
        logger.info("="*80)
        
        return result
        
    except Exception as e:
        logger.error("="*80)
        logger.error(f"❌ HABIT ANALYSIS FAILED")
        logger.error(f"Error: {str(e)}")
        logger.error("="*80)
        traceback.print_exc()
        
        return {
            "status": "error",
            "username": uid,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc()
        }


def generate_habit_analysis_report_cached(
    uid: str,
    cache_hours: int = 24,
    **kwargs
) -> Dict[str, Any]:
    """
    Cached version of habit analysis that checks for recent reports.
    
    Args:
        uid: User ID
        cache_hours: Hours before regenerating report (default: 24)
        **kwargs: Additional parameters passed to generate_habit_analysis_report
    
    Returns:
        Same as generate_habit_analysis_report, with additional "cached" field
    
    Note:
        This is a placeholder for implementing caching logic with Redis/Firestore.
        For now, it just calls the main function.
    """
    # TODO: Implement caching logic
    # - Check if cached report exists in Firestore/Redis
    # - Check if cached report is still valid (< cache_hours old)
    # - Return cached report if valid
    # - Otherwise, generate new report and cache it
    
    logger.info(f"Cache check for user {uid} (TTL: {cache_hours}h)")
    
    result = generate_habit_analysis_report(uid, **kwargs)
    result["cached"] = False
    
    return result


# ============================================================
# TEST FUNCTION
# ============================================================
def test_habit_analyzer():
    """
    Test the complete habit analysis pipeline.
    """
    print("\n" + "="*80)
    print("🧪 TESTING HABIT ANALYZER")
    print("="*80)
    
    # Test user
    test_uid = "KwpGnNMQiYYaN3RY5qDT9xIsWZ33"
    
    # Generate report
    result = generate_habit_analysis_report(
        uid=test_uid)
    
    # Display results
    print("\n" + "="*80)
    print("📊 ANALYSIS RESULTS")
    print("="*80)
    
    if result["status"] == "error":
        print(f"\n❌ Error: {result['error']}")
        return
    
    print(f"\n📈 Overall Score: {result['overall_score']['score']}/100 ({result['overall_score']['grade']})")
    print(f"Description: {result['overall_score']['description']}")
    
    print(f"\n📝 Summary:")
    print(f"{result['summary']}")
    
    print(f"\n🔍 Macro Trends ({len(result['macro_trends'])}):")
    for trend in result['macro_trends'][:5]:
        print(f"  • {trend['description']}")
    
    print(f"\n💪 Engagement:")
    for category, data in result['engagement'].items():
        print(f"  • {category}: {data['description']}")
    
    if result['risk_flags']:
        print(f"\n⚠️ Risk Flags ({len(result['risk_flags'])}):")
        for flag in result['risk_flags']:
            print(f"  {flag}")
    
    if result['anomalies']:
        print(f"\n🚨 Anomalies Detected ({len(result['anomalies'])}):")
        for anomaly in result['anomalies'][:3]:
            print(f"  • {anomaly['date']}: {anomaly['feature']} - {anomaly['direction']} (z={anomaly['z_score']})")
    
    print(f"\n📊 Forecast Period: {result['forecast_period']['start']} to {result['forecast_period']['end']}")
    print(f"Forecast Days: {len(result['forecast_data'])}")
    
    print("\n" + "="*80)
    print("✅ TEST COMPLETE")
    print("="*80)
    
    return result


# ============================================================
# FASTAPI INTEGRATION EXAMPLE
# ============================================================
"""
# Add to your FastAPI app:

from fastapi import APIRouter, HTTPException
from Engines.HabitAnalysis.HabitAnalyzer import generate_habit_analysis_report

router = APIRouter()

@router.get("/user/{uid}/habit-analysis")
async def get_habit_analysis(uid: str):
    '''
    Generate complete habit analysis report for a user.
    
    Returns:
        JSON with habit trends, forecasts, insights, and recommendations
    '''
    result = generate_habit_analysis_report(uid)
    
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@router.get("/user/{uid}/habit-analysis/summary")
async def get_habit_summary(uid: str):
    '''
    Get just the summary and score (faster, lighter response).
    '''
    result = generate_habit_analysis_report(uid)
    
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {
        "username": result["username"],
        "summary": result["summary"],
        "overall_score": result["overall_score"],
        "risk_flags": result["risk_flags"],
        "generated_at": result["generated_at"]
    }
"""


if __name__ == "__main__":
    # Run test
    test_habit_analyzer()