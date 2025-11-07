"""
InsightEngine.py - Module 4 of Habit Analysis Pipeline

Purpose:
    To transform Chronos forecasts into human-friendly habit insights, trend labels,
    and actionable recommendations.

    This is the final step where we convert raw predictions into:
    "Your protein intake is trending up by 12% next week"
    "Meal frequency may drop this weekend - consider meal prep"

Responsibilities:
    - Trend Analysis: Compare historical vs predicted patterns
    - Anomaly Detection: Spot unusual spikes or drops
    - Insight Generation: Create structured, readable summaries
    - Categorization: Label insights as Positive/Negative/Stable
    - Report Building: Package everything for user dashboard
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import date, timedelta
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class InsightEngine:
    """
    Generates interpretable insights from Chronos forecasts.
    """

    def __init__(
        self,
        forecast_df: pd.DataFrame,
        recent_df: pd.DataFrame,
        feature_focus: Optional[List[str]] = None,
        threshold_percent: float = 5.0
    ):
        """
        Initialize the insight engine.

        Args:
            forecast_df: DataFrame with predicted values (7 days × features)
            recent_df: DataFrame with recent actual values (last 7-30 days × features)
            feature_focus: Subset of features to analyze (None = analyze key features)
            threshold_percent: % change threshold to consider a trend significant
        """
        self.forecast_df = forecast_df
        self.recent_df = recent_df
        self.threshold_percent = threshold_percent
        
        # Define key features to focus on if not specified
        if feature_focus is None:
            self.feature_focus = [
                'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
                'meal_count', 'water_intake_ml', 'current_streak',
                'protein_to_calories', 'macro_balance'
            ]
        else:
            self.feature_focus = feature_focus
        
        # Filter to only features that exist in both dataframes
        self.feature_focus = [
            f for f in self.feature_focus 
            if f in forecast_df.columns and f in recent_df.columns
        ]
        
        logger.info(f"InsightEngine initialized with {len(self.feature_focus)} focus features")
        logger.info(f"Recent data: {len(recent_df)} days, Forecast: {len(forecast_df)} days")

    def compute_trend(self, feature: str) -> Dict[str, Any]:
        """
        Compares mean of recent period vs forecast period for a single feature.

        Args:
            feature: Feature name to analyze

        Returns:
            Dict containing:
                - feature: Feature name
                - trend: "up" | "down" | "stable"
                - percent_change: Percentage change
                - recent_mean: Average of recent period
                - forecast_mean: Average of forecast period
                - direction: "improving" | "declining" | "stable" (contextual)
        """
        if feature not in self.recent_df.columns or feature not in self.forecast_df.columns:
            logger.warning(f"Feature {feature} not found in data")
            return None
        
        # Get last 7 days of recent data for fair comparison
        recent_values = self.recent_df[feature].tail(7)
        forecast_values = self.forecast_df[feature]
        
        # Calculate means
        recent_mean = recent_values.mean()
        forecast_mean = forecast_values.mean()
        
        # Handle division by zero
        if abs(recent_mean) < 1e-8:
            if abs(forecast_mean) < 1e-8:
                percent_change = 0.0
            else:
                percent_change = 100.0 if forecast_mean > 0 else -100.0
        else:
            percent_change = ((forecast_mean - recent_mean) / abs(recent_mean)) * 100
        
        # Determine trend
        if abs(percent_change) < self.threshold_percent:
            trend = "stable"
        elif percent_change > 0:
            trend = "up"
        else:
            trend = "down"
        
        # Contextual direction (some increases are good, some bad)
        direction = self._interpret_direction(feature, trend)
        
        return {
            "feature": feature,
            "trend": trend,
            "percent_change": round(percent_change, 1),
            "recent_mean": round(recent_mean, 2),
            "forecast_mean": round(forecast_mean, 2),
            "direction": direction,
            "recent_std": round(recent_values.std(), 2),
            "forecast_std": round(forecast_values.std(), 2)
        }

    def _interpret_direction(self, feature: str, trend: str) -> str:
        """
        Interprets whether a trend is positive or negative based on feature context.

        Args:
            feature: Feature name
            trend: "up" | "down" | "stable"

        Returns:
            "improving" | "declining" | "stable" | "concerning"
        """
        if trend == "stable":
            return "stable"
        
        # Features where increase is generally positive
        positive_increase = [
            'protein_g', 'fiber_g', 'water_intake_ml', 'current_streak',
            'meal_count', 'vitamin_c_g', 'calcium_mg', 'iron_mg',
            'protein_to_calories', 'water_percentage_completed'
        ]
        
        # Features where decrease is generally positive
        positive_decrease = [
            'sugar_g', 'sodium_mg', 'saturated_fat_g', 'trans_fat_g',
            'cholesterol_mg', 'calories_variability', 'macro_balance'
        ]
        
        # Neutral features (context-dependent)
        neutral = ['calories', 'carbs_g', 'fat_g']
        
        if feature in positive_increase:
            return "improving" if trend == "up" else "declining"
        elif feature in positive_decrease:
            return "improving" if trend == "down" else "concerning"
        elif feature in neutral:
            return "changing"
        else:
            return "neutral"

    def summarize_macro_trends(self) -> List[Dict[str, Any]]:
        """
        Generates readable summaries for macronutrient trends.

        Returns:
            List of trend summaries with human-readable descriptions
        """
        macro_features = ['calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g']
        trends = []
        
        for feature in macro_features:
            if feature not in self.feature_focus:
                continue
            
            trend_data = self.compute_trend(feature)
            if trend_data is None:
                continue
            
            # Create human-readable description
            description = self._create_trend_description(trend_data)
            
            trends.append({
                **trend_data,
                "description": description
            })
        
        logger.info(f"Generated {len(trends)} macro trend summaries")
        return trends

    def _create_trend_description(self, trend_data: Dict) -> str:
        """
        Creates a human-readable description of a trend.

        Args:
            trend_data: Trend dictionary from compute_trend()

        Returns:
            Human-readable string description
        """
        feature = trend_data['feature']
        trend = trend_data['trend']
        change = trend_data['percent_change']
        direction = trend_data['direction']
        
        # Clean feature name for display
        feature_display = feature.replace('_', ' ').title()
        
        if trend == "stable":
            return f"{feature_display} remaining steady"
        
        # Direction symbols
        symbol = "↑" if trend == "up" else "↓"
        
        # Magnitude description
        if abs(change) < 10:
            magnitude = "slightly"
        elif abs(change) < 25:
            magnitude = "moderately"
        else:
            magnitude = "significantly"
        
        # Sentiment
        if direction == "improving":
            sentiment = "✓"
        elif direction == "declining":
            sentiment = "!"
        elif direction == "concerning":
            sentiment = "⚠"
        else:
            sentiment = ""
        
        return f"{sentiment} {feature_display} {magnitude} {trend} {symbol} ({change:+.1f}%)"

    def analyze_engagement_patterns(self) -> Dict[str, Any]:
        """
        Analyzes user engagement patterns (meals, water, streaks).

        Returns:
            Dict with engagement insights
        """
        engagement = {}
        
        # Meal frequency analysis
        if 'meal_count' in self.feature_focus:
            meal_trend = self.compute_trend('meal_count')
            if meal_trend:
                engagement['meal_frequency'] = {
                    "status": meal_trend['trend'],
                    "description": self._create_trend_description(meal_trend),
                    "avg_meals_per_day": round(meal_trend['forecast_mean'], 1)
                }
        
        # Hydration analysis
        if 'water_intake_ml' in self.feature_focus:
            water_trend = self.compute_trend('water_intake_ml')
            if water_trend:
                engagement['hydration'] = {
                    "status": water_trend['trend'],
                    "description": self._create_trend_description(water_trend),
                    "avg_ml_per_day": round(water_trend['forecast_mean'], 0)
                }
        
        # Streak momentum
        if 'current_streak' in self.feature_focus:
            streak_trend = self.compute_trend('current_streak')
            if streak_trend:
                engagement['streak'] = {
                    "status": streak_trend['trend'],
                    "description": self._create_trend_description(streak_trend),
                    "projected_streak": round(streak_trend['forecast_mean'], 0)
                }
        
        logger.info(f"Analyzed {len(engagement)} engagement patterns")
        return engagement

    def detect_anomalies(self) -> List[Dict[str, Any]]:
        """
        Detects unusual spikes or drops in forecasted values.

        Returns:
            List of anomaly warnings
        """
        anomalies = []
        
        for feature in self.feature_focus:
            if feature not in self.forecast_df.columns:
                continue
            
            forecast_values = self.forecast_df[feature]
            recent_values = self.recent_df[feature].tail(7)
            
            # Calculate z-scores relative to recent period
            recent_mean = recent_values.mean()
            recent_std = recent_values.std()
            
            if recent_std < 1e-8:
                continue
            
            # Check each forecast day for anomalies
            for day_idx, day_value in enumerate(forecast_values):
                z_score = (day_value - recent_mean) / recent_std
                
                if abs(z_score) > 2.5:  # Significant deviation
                    forecast_date = self.forecast_df.index[day_idx]
                    
                    anomalies.append({
                        "feature": feature,
                        "date": str(forecast_date.date()) if hasattr(forecast_date, 'date') else str(forecast_date),
                        "z_score": round(z_score, 2),
                        "severity": "high" if abs(z_score) > 3 else "medium",
                        "direction": "spike" if z_score > 0 else "drop",
                        "value": round(day_value, 2),
                        "expected": round(recent_mean, 2)
                    })
        
        logger.info(f"Detected {len(anomalies)} anomalies")
        return anomalies

    def generate_risk_flags(self) -> List[str]:
        """
        Generates actionable risk flags based on predicted patterns.

        Returns:
            List of warning messages
        """
        flags = []
        
        # Check for consistently low meal frequency
        if 'meal_count' in self.feature_focus:
            forecast_meals = self.forecast_df['meal_count']
            if forecast_meals.mean() < 1.5:
                flags.append("⚠ Low meal frequency predicted - consider meal planning")
        
        # Check for dehydration risk
        if 'water_intake_ml' in self.feature_focus:
            forecast_water = self.forecast_df['water_intake_ml']
            if forecast_water.mean() < 1500:  # Below recommended minimum
                flags.append("💧 Low hydration forecast - set reminders to drink water")
        
        # Check for protein deficiency risk
        if 'protein_g' in self.feature_focus:
            forecast_protein = self.forecast_df['protein_g']
            if forecast_protein.mean() < 50:  # Rough minimum for adults
                flags.append("🥩 Protein intake may be insufficient - consider protein-rich meals")
        
        # Check for macro imbalance
        if 'macro_balance' in self.feature_focus:
            forecast_balance = self.forecast_df['macro_balance']
            if forecast_balance.mean() > 0.4:  # High imbalance
                flags.append("⚖️ Macro distribution may be imbalanced - aim for variety")
        
        # Check for streak decline
        if 'current_streak' in self.feature_focus:
            streak_trend = self.compute_trend('current_streak')
            if streak_trend and streak_trend['trend'] == 'down':
                flags.append("📉 Tracking streak may decline - stay consistent!")
        
        logger.info(f"Generated {len(flags)} risk flags")
        return flags

    def build_report(self) -> Dict[str, Any]:
        """
        Main wrapper combining all insights into structured output.

        Returns:
            Comprehensive habit analysis report
        """
        logger.info("="*80)
        logger.info("BUILDING INSIGHT REPORT")
        logger.info("="*80)
        
        # Generate all components
        macro_trends = self.summarize_macro_trends()
        engagement = self.analyze_engagement_patterns()
        anomalies = self.detect_anomalies()
        risk_flags = self.generate_risk_flags()
        
        # Create executive summary
        summary = self._create_executive_summary(macro_trends, engagement, risk_flags)
        
        # Compile report
        report = {
            "generated_at": str(date.today()),
            "forecast_period": {
                "start": str(self.forecast_df.index[0].date()) if hasattr(self.forecast_df.index[0], 'date') else str(self.forecast_df.index[0]),
                "end": str(self.forecast_df.index[-1].date()) if hasattr(self.forecast_df.index[-1], 'date') else str(self.forecast_df.index[-1]),
                "days": len(self.forecast_df)
            },
            "summary": summary,
            "macro_trends": macro_trends,
            "engagement": engagement,
            "anomalies": anomalies,
            "risk_flags": risk_flags,
            "overall_score": self._calculate_overall_score(macro_trends, engagement, risk_flags)
        }
        
        logger.info("✓ Insight report generated successfully")
        logger.info("="*80)
        
        return report

    def _create_executive_summary(
        self, 
        macro_trends: List[Dict], 
        engagement: Dict,
        risk_flags: List[str]
    ) -> str:
        """
        Creates a concise executive summary of all insights.

        Args:
            macro_trends: List of macro trend dicts
            engagement: Engagement patterns dict
            risk_flags: List of warning messages

        Returns:
            Human-readable summary paragraph
        """
        summaries = []
        
        # Summarize macro trends
        improving = [t for t in macro_trends if t.get('direction') == 'improving']
        declining = [t for t in macro_trends if t.get('direction') == 'declining']
        
        if improving:
            features = ', '.join([t['feature'].replace('_', ' ') for t in improving[:2]])
            summaries.append(f"{features} showing improvement")
        
        if declining:
            features = ', '.join([t['feature'].replace('_', ' ') for t in declining[:2]])
            summaries.append(f"{features} declining")
        
        if not improving and not declining:
            summaries.append("nutrition patterns stable")
        
        # Add engagement summary
        if engagement:
            if 'hydration' in engagement:
                status = engagement['hydration']['status']
                summaries.append(f"hydration {status}")
        
        # Add risk context
        if risk_flags:
            summaries.append(f"{len(risk_flags)} areas need attention")
        else:
            summaries.append("no major concerns")
        
        return "Overall: " + "; ".join(summaries) + "."

    def _calculate_overall_score(
        self,
        macro_trends: List[Dict],
        engagement: Dict,
        risk_flags: List[str]
    ) -> Dict[str, Any]:
        """
        Calculates an overall habit health score.

        Returns:
            Dict with score and grade
        """
        score = 100
        
        # Deduct for declining trends
        declining = [t for t in macro_trends if t.get('direction') == 'declining']
        score -= len(declining) * 5
        
        # Deduct for concerning trends
        concerning = [t for t in macro_trends if t.get('direction') == 'concerning']
        score -= len(concerning) * 10
        
        # Deduct for risk flags
        score -= len(risk_flags) * 8
        
        # Bonus for improving trends
        improving = [t for t in macro_trends if t.get('direction') == 'improving']
        score += len(improving) * 3
        
        # Cap at 0-100
        score = max(0, min(100, score))
        
        # Assign grade
        if score >= 90:
            grade = "A"
        elif score >= 80:
            grade = "B"
        elif score >= 70:
            grade = "C"
        elif score >= 60:
            grade = "D"
        else:
            grade = "F"
        
        return {
            "score": score,
            "grade": grade,
            "description": self._get_grade_description(grade)
        }

    def _get_grade_description(self, grade: str) -> str:
        """Returns a description for each grade."""
        descriptions = {
            "A": "Excellent habits - keep it up!",
            "B": "Good habits with room for improvement",
            "C": "Average habits - focus on consistency",
            "D": "Habits need attention - review recommendations",
            "F": "Significant improvements needed"
        }
        return descriptions.get(grade, "")


# Testing and example usage
def Test():
    """
    Test InsightEngine with real forecast data.
    """
    from datetime import date, timedelta
    
    # Import dependencies
    try:
        from Engines.Analysis.DataExtractor import DataExtractor
        from Engines.Analysis.FeatureBuilder import FeatureBuilder
        from Engines.Analysis.ChronosModel import ChronosModel
    except ImportError:
        logger.error("Cannot import required modules")
        return
    
    print("\n" + "="*80)
    print("INSIGHT ENGINE - TEST RUN")
    print("="*80)
    
    # Test user
    username = "KwpGnNMQiYYaN3RY5qDT9xIsWZ33"
    print(f"User: {username}")
    print("="*80 + "\n")
    
    # Step 1: Extract and build features
    print("[STEP 1] Extracting and building features...")
    extractor = DataExtractor(username)
    end_date = date.today()
    start_date = end_date - timedelta(days=60)
    raw_data = extractor.build_raw_data(start_date, end_date)
    
    builder = FeatureBuilder(normalize=True, window_days=7)
    context_tensor = builder.build_feature_matrix(raw_data, context_length=30)
    print(f"✓ Context ready: {context_tensor.shape}\n")
    
    # Step 2: Generate forecast
    print("[STEP 2] Generating forecast...")
    model = ChronosModel(prediction_length=7, num_samples=20)
    forecast_result = model.get_forecast(
        context_tensor=context_tensor,
        feature_names=builder.feature_columns,
        norm_params=builder.norm_params,
        start_date=end_date
    )
    print(f"✓ Forecast ready: {forecast_result['shape']}\n")
    
    # Step 3: Build DataFrames for InsightEngine
    print("[STEP 3] Preparing data for insight generation...")
    
    # Recent data (rebuild without normalization for comparison)
    builder_raw = FeatureBuilder(normalize=False, window_days=7)
    _ = builder_raw.build_feature_matrix(raw_data, context_length=30)
    recent_df = builder_raw.build_dataframe(raw_data)
    
    # Forecast data
    forecast_df = pd.DataFrame(forecast_result['forecast'])
    forecast_df['date'] = pd.to_datetime(forecast_df['date'])
    forecast_df = forecast_df.set_index('date')
    
    print(f"✓ Recent data: {len(recent_df)} days")
    print(f"✓ Forecast data: {len(forecast_df)} days\n")
    
    # Step 4: Generate insights
    print("[STEP 4] Generating insights...")
    engine = InsightEngine(
        forecast_df=forecast_df,
        recent_df=recent_df,
        threshold_percent=5.0
    )
    
    report = engine.build_report()
    print("✓ Report generated\n")
    
    # Step 5: Display report
    print("="*80)
    print("INSIGHT REPORT")
    print("="*80)
    
    print(f"\n📊 EXECUTIVE SUMMARY")
    print(f"{report['summary']}")
    
    print(f"\n📈 OVERALL SCORE: {report['overall_score']['score']}/100 (Grade: {report['overall_score']['grade']})")
    print(f"{report['overall_score']['description']}")
    
    print(f"\n🍎 MACRO TRENDS:")
    for trend in report['macro_trends']:
        print(f"  {trend['description']}")
    
    print(f"\n💪 ENGAGEMENT:")
    for category, data in report['engagement'].items():
        print(f"  {category.upper()}: {data['description']}")
    
    if report['anomalies']:
        print(f"\n⚠️ ANOMALIES DETECTED:")
        for anomaly in report['anomalies'][:5]:  # Show first 5
            print(f"  {anomaly['date']}: {anomaly['feature']} - {anomaly['direction']} (z={anomaly['z_score']})")
    
    if report['risk_flags']:
        print(f"\n🚩 RECOMMENDATIONS:")
        for flag in report['risk_flags']:
            print(f"  {flag}")
    else:
        print(f"\n✅ No major concerns detected")
    
    print("\n" + "="*80)
    print("INSIGHT GENERATION COMPLETE")
    print("="*80)
    
    # Step 6: Export JSON
    print("\n[STEP 5] Sample JSON output:")
    print(json.dumps({
        "summary": report['summary'],
        "overall_score": report['overall_score'],
        "macro_trends_count": len(report['macro_trends']),
        "risk_flags_count": len(report['risk_flags'])
    }, indent=2))
    
    print("\n✓ InsightEngine test complete!")
    print("✓ Full pipeline: DataExtractor → FeatureBuilder → ChronosModel → InsightEngine ✓")


if __name__ == "__main__":
    Test()