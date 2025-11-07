import torch
import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Tuple
from transformers import AutoModelForSeq2SeqLM, AutoConfig
from dataclasses import dataclass
import json

from Config import firestoreDB
from Engines.DB_Engine.NutritionFeatureExtractor import NutritionFeatureExtractor


@dataclass
class ForecastInsight:
    """Structure for forecast insights"""
    feature: str
    trend: str  # "increasing", "decreasing", "stable"
    change_magnitude: float
    interpretation: str
    current_avg: float
    forecast_avg: float


class ChronosNutritionForecaster:
    """
    Chronos-based nutrition and behavior forecaster.
    Generates 7-day predictions for all nutrition features.
    """
    
    def __init__(
        self, 
        model_name: str = "amazon/chronos-t5-base",
        device: Optional[str] = None
    ):
        """
        Initialize Chronos forecaster.
        
        Args:
            model_name: Hugging Face model identifier
                Options: "amazon/chronos-t5-small", "base", "large"
            device: Device to use ("cuda", "cpu", or None for auto)
        """
        self.model_name = model_name
        
        # Determine device
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        print(f"Initializing Chronos model: {model_name}")
        print(f"Using device: {self.device}")
        
        # Load model
        try:
            # Load model configuration
            config = AutoConfig.from_pretrained(model_name)
            
            # Load model with appropriate dtype based on device
            if self.device == "cuda":
                self.model = AutoModelForSeq2SeqLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16,
                    device_map="auto",
                    low_cpu_mem_usage=True
                )
            else:
                self.model = AutoModelForSeq2SeqLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float32
                )
                self.model = self.model.to(self.device)
            
            self.model.eval()
            print("✓ Model loaded successfully")
            
        except Exception as e:
            print(f"✗ Error loading model: {e}")
            print("Falling back to smaller model...")
            self.model_name = "amazon/chronos-t5-small"
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float32
            )
            self.model = self.model.to(self.device)
            self.model.eval()
    
    def generate_forecast(
        self,
        context_tensor: torch.Tensor,
        prediction_length: int = 7,
        num_samples: int = 20,
        temperature: float = 1.0
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Generate probabilistic forecast using Chronos.
        
        Args:
            context_tensor: Historical data tensor (context_length, n_features)
            prediction_length: Number of days to forecast
            num_samples: Number of sample trajectories to generate
            temperature: Sampling temperature (higher = more variation)
            
        Returns:
            Tuple of (median_forecast, quantile_forecasts)
            - median_forecast: (prediction_length, n_features)
            - quantile_forecasts: dict with keys like "q10", "q50", "q90"
        """
        print(f"\nGenerating {prediction_length}-day forecast...")
        print(f"Context shape: {context_tensor.shape}")
        print(f"Samples: {num_samples}, Temperature: {temperature}")
        
        # Add batch dimension if not present
        if context_tensor.dim() == 2:
            context_tensor = context_tensor.unsqueeze(0)
        
        # Move to correct device
        context_tensor = context_tensor.to(self.device)
        
        # Generate forecasts
        with torch.no_grad():
            all_forecasts = []
            
            for i in range(num_samples):
                forecast_output = self.model.generate(
                    inputs=context_tensor,
                    max_length=prediction_length,
                    do_sample=True,
                    temperature=temperature,
                    num_return_sequences=1
                )
                all_forecasts.append(forecast_output)
            
            # Stack all samples: (num_samples, prediction_length, n_features)
            all_forecasts = torch.cat(all_forecasts, dim=0)
        
        # Calculate statistics across samples
        median_forecast = torch.median(all_forecasts, dim=0).values
        
        # Calculate quantiles
        quantiles = {}
        for q_name, q_value in [("q10", 0.1), ("q25", 0.25), ("q50", 0.5), 
                                 ("q75", 0.75), ("q90", 0.9)]:
            quantiles[q_name] = torch.quantile(
                all_forecasts, q_value, dim=0
            )
        
        print(f"✓ Forecast generated. Output shape: {median_forecast.shape}")
        
        return median_forecast.cpu(), quantiles
    
    def analyze_trends(
        self,
        historical_df: pd.DataFrame,
        forecast_df: pd.DataFrame,
        key_features: Optional[List[str]] = None
    ) -> List[ForecastInsight]:
        """
        Analyze trends between historical data and forecasts.
        
        Args:
            historical_df: Historical feature DataFrame
            forecast_df: Forecasted feature DataFrame
            key_features: Features to analyze (None = all macro features)
            
        Returns:
            List of ForecastInsight objects
        """
        if key_features is None:
            key_features = [
                "calories", "protein_g", "carbs_g", "fat_g",
                "fiber_g", "sugar_g", "meal_count", "streak",
                "water_intake_ml", "combined_intensity"
            ]
        
        insights = []
        
        for feature in key_features:
            if feature not in historical_df.columns or feature not in forecast_df.columns:
                continue
            
            # Calculate averages
            hist_avg = historical_df[feature].tail(7).mean()  # Last week
            forecast_avg = forecast_df[feature].mean()
            
            # Calculate change
            change = forecast_avg - hist_avg
            pct_change = (change / hist_avg * 100) if hist_avg > 0 else 0
            
            # Determine trend
            if abs(pct_change) < 5:
                trend = "stable"
                interpretation = f"{feature} expected to remain stable"
            elif pct_change > 0:
                trend = "increasing"
                interpretation = f"{feature} projected to increase by {pct_change:.1f}%"
            else:
                trend = "decreasing"
                interpretation = f"{feature} projected to decrease by {abs(pct_change):.1f}%"
            
            insights.append(ForecastInsight(
                feature=feature,
                trend=trend,
                change_magnitude=change,
                interpretation=interpretation,
                current_avg=hist_avg,
                forecast_avg=forecast_avg
            ))
        
        return insights
    
    def generate_recommendations(
        self,
        insights: List[ForecastInsight],
        user_goals: Optional[Dict] = None
    ) -> List[str]:
        """
        Generate actionable recommendations based on forecast insights.
        
        Args:
            insights: List of forecast insights
            user_goals: Optional user goal parameters (TDEE, protein target, etc.)
            
        Returns:
            List of recommendation strings
        """
        recommendations = []
        
        for insight in insights:
            feature = insight.feature
            trend = insight.trend
            
            # Calorie recommendations
            if feature == "calories":
                if trend == "increasing" and insight.forecast_avg > 2500:
                    recommendations.append(
                        "⚠️ Calorie intake trending upward. Consider portion control "
                        "or increasing physical activity."
                    )
                elif trend == "decreasing" and insight.forecast_avg < 1500:
                    recommendations.append(
                        "⚠️ Calorie intake trending downward. Ensure you're meeting "
                        "minimum daily energy requirements."
                    )
            
            # Protein recommendations
            elif feature == "protein_g":
                if trend == "decreasing" and insight.forecast_avg < 50:
                    recommendations.append(
                        "💪 Protein intake is declining. Consider adding lean meats, "
                        "fish, eggs, or plant-based proteins to your meals."
                    )
                elif trend == "stable" and insight.forecast_avg > 100:
                    recommendations.append(
                        "✓ Excellent protein intake consistency. Maintain this pattern!"
                    )
            
            # Fiber recommendations
            elif feature == "fiber_g":
                if insight.forecast_avg < 25:
                    recommendations.append(
                        "🥗 Fiber intake below recommended levels. Add more vegetables, "
                        "fruits, whole grains, and legumes."
                    )
            
            # Sugar recommendations
            elif feature == "sugar_g":
                if trend == "increasing" and insight.forecast_avg > 50:
                    recommendations.append(
                        "🍬 Sugar intake increasing. Consider reducing processed foods "
                        "and sugary beverages."
                    )
            
            # Engagement recommendations
            elif feature == "meal_count":
                if trend == "decreasing" and insight.forecast_avg < 3:
                    recommendations.append(
                        "📝 Meal logging frequency declining. Set reminders to maintain "
                        "consistent tracking."
                    )
            
            elif feature == "streak":
                if trend == "decreasing":
                    recommendations.append(
                        "🔥 Logging streak at risk. Stay consistent to maintain progress!"
                    )
            
            # Hydration recommendations
            elif feature == "water_intake_ml":
                if insight.forecast_avg < 2000:
                    recommendations.append(
                        "💧 Hydration forecast shows low water intake. Aim for at least "
                        "2 liters per day."
                    )
        
        return recommendations
    
    def save_forecast_to_firestore(
        self,
        username: str,
        forecast_df: pd.DataFrame,
        insights: List[ForecastInsight],
        recommendations: List[str],
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Save forecast results to Firestore.
        
        Args:
            username: User identifier
            forecast_df: Forecast DataFrame
            insights: List of insights
            recommendations: List of recommendations
            metadata: Additional metadata (model info, etc.)
            
        Returns:
            Document ID of saved forecast
        """
        user_ref = firestoreDB.collection('users').document(username)
        
        if not user_ref.get().exists:
            raise ValueError(f"User {username} not found")
        
        # Convert forecast to serializable format
        forecast_data = []
        for date_idx, row in forecast_df.iterrows():
            forecast_data.append({
                "date": date_idx.strftime("%Y-%m-%d"),
                "features": row.to_dict()
            })
        
        # Convert insights to dict
        insights_data = [
            {
                "feature": ins.feature,
                "trend": ins.trend,
                "change_magnitude": float(ins.change_magnitude),
                "interpretation": ins.interpretation,
                "current_avg": float(ins.current_avg),
                "forecast_avg": float(ins.forecast_avg)
            }
            for ins in insights
        ]
        
        # Prepare document
        forecast_doc = {
            "timestamp": datetime.now(),
            "forecast_start_date": forecast_df.index[0].strftime("%Y-%m-%d"),
            "forecast_end_date": forecast_df.index[-1].strftime("%Y-%m-%d"),
            "forecast_data": forecast_data,
            "insights": insights_data,
            "recommendations": recommendations,
            "metadata": metadata or {},
            "model_name": self.model_name
        }
        
        # Save to Firestore
        forecast_ref = user_ref.collection('Forecasts').add(forecast_doc)
        doc_id = forecast_ref[1].id
        
        print(f"✓ Forecast saved to Firestore: {doc_id}")
        return doc_id
    
    def run_full_pipeline(
        self,
        username: str,
        context_days: int = 30,
        prediction_days: int = 7,
        save_to_db: bool = True
    ) -> Dict:
        """
        Run complete forecasting pipeline for a user.
        
        Args:
            username: User identifier
            context_days: Days of historical data to use
            prediction_days: Days to forecast
            save_to_db: Whether to save results to Firestore
            
        Returns:
            Dictionary with forecast results, insights, and recommendations
        """
        print(f"\n{'='*60}")
        print(f"Running Chronos Forecast Pipeline for user: {username}")
        print(f"{'='*60}")
        
        # Step 1: Extract features
        print("\n[1/5] Extracting historical features...")
        extractor = NutritionFeatureExtractor(username)
        
        end_date = date.today()
        start_date = end_date - timedelta(days=context_days)
        
        features_df = extractor.build_feature_vector(start_date, end_date)
        print(f"✓ Extracted {len(features_df)} days of data with {len(features_df.columns)} features")
        
        # Step 2: Prepare for Chronos
        print("\n[2/5] Preparing context tensor...")
        context_tensor = extractor.prepare_for_chronos(
            features_df, 
            context_length=context_days,
            normalize=True
        )
        print(f"✓ Context tensor shape: {context_tensor.shape}")
        
        # Step 3: Generate forecast
        print("\n[3/5] Generating forecast with Chronos...")
        median_forecast, quantiles = self.generate_forecast(
            context_tensor,
            prediction_length=prediction_days,
            num_samples=20
        )
        
        # Denormalize
        forecast_denorm = extractor.denormalize_forecast(median_forecast.numpy())
        
        # Create forecast DataFrame
        forecast_dates = pd.date_range(
            end_date + timedelta(days=1),
            periods=prediction_days,
            freq='D'
        )
        forecast_df = pd.DataFrame(
            forecast_denorm,
            columns=extractor.feature_columns,
            index=forecast_dates
        )
        
        print(f"✓ Forecast generated for {len(forecast_df)} days")
        
        # Step 4: Analyze trends
        print("\n[4/5] Analyzing trends and generating insights...")
        insights = self.analyze_trends(features_df, forecast_df)
        print(f"✓ Generated {len(insights)} insights")
        
        # Step 5: Generate recommendations
        recommendations = self.generate_recommendations(insights)
        print(f"✓ Generated {len(recommendations)} recommendations")
        
        # Save to Firestore
        doc_id = None
        if save_to_db:
            print("\n[5/5] Saving to Firestore...")
            metadata = {
                "context_days": context_days,
                "prediction_days": prediction_days,
                "num_features": len(extractor.feature_columns),
                "device": self.device
            }
            doc_id = self.save_forecast_to_firestore(
                username,
                forecast_df,
                insights,
                recommendations,
                metadata
            )
        
        print(f"\n{'='*60}")
        print("Pipeline Complete!")
        print(f"{'='*60}\n")
        
        return {
            "forecast_id": doc_id,
            "forecast_df": forecast_df,
            "insights": insights,
            "recommendations": recommendations,
            "historical_df": features_df,
            "quantiles": quantiles
        }


def print_forecast_summary(results: Dict):
    """Print a formatted summary of forecast results."""
    forecast_df = results["forecast_df"]
    insights = results["insights"]
    recommendations = results["recommendations"]
    
    print("\n" + "="*60)
    print("FORECAST SUMMARY")
    print("="*60)
    
    # Key metrics forecast
    print("\n📊 Predicted Averages (Next 7 Days):")
    key_metrics = ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g"]
    for metric in key_metrics:
        if metric in forecast_df.columns:
            avg = forecast_df[metric].mean()
            print(f"  • {metric.replace('_', ' ').title()}: {avg:.1f}")
    
    # Trends
    print("\n📈 Key Trends:")
    for insight in insights[:5]:  # Top 5
        emoji = "📈" if insight.trend == "increasing" else "📉" if insight.trend == "decreasing" else "➡️"
        print(f"  {emoji} {insight.interpretation}")
    
    # Recommendations
    if recommendations:
        print("\n💡 Recommendations:")
        for rec in recommendations[:5]:  # Top 5
            print(f"  {rec}")
    
    print("\n" + "="*60 + "\n")


# Main execution
def Test():
    # Configuration
    USERNAME = "KwpGnNMQiYYaN3RY5qDT9xIsWZ33"
    
    # Initialize forecaster
    forecaster = ChronosNutritionForecaster(
        model_name="amazon/chronos-t5-base"  # Use "small" if GPU memory limited
    )
    
    # Run pipeline
    results = forecaster.run_full_pipeline(
        username=USERNAME,
        context_days=30,
        prediction_days=7,
        save_to_db=False
    )
    
    # Print summary
    print_forecast_summary(results)
    
    # Display detailed forecast
    print("\nDetailed Forecast DataFrame:")
    print(results["forecast_df"].round(2))