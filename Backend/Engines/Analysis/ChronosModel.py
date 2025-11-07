"""
ChronosModel.py - Module 3 of Habit Analysis Pipeline

Purpose:
    To take the enriched, normalized feature tensor from FeatureBuilder and generate
    multivariate time-series forecasts (e.g., 7-day nutrient & habit projections)
    using Amazon's Chronos-T5 model.

    This module acts as the inference brain — decoding habits, forecasting future
    nutrition/engagement patterns, and packaging them for the insight engine.

Responsibilities:
    - Model Loading: Initialize Chronos-T5 with GPU/CPU auto-detection
    - Input Preparation: Format (T, F) tensors for Chronos compatibility
    - Inference: Generate predictions for each feature independently
    - Denormalization: Convert normalized predictions back to real scales
    - Output Formatting: Package forecasts as structured DataFrames/dicts
"""

import torch
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import date, timedelta
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChronosModel:
    """
    Wraps Amazon Chronos-T5 for multivariate habit forecasting.
    Handles GPU/CPU execution, context setup, and output formatting.
    """

    def __init__(
        self,
        model_name: str = "amazon/chronos-t5-base",
        device: Optional[str] = None,
        prediction_length: int = 7,
        num_samples: int = 20,
        temperature: float = 1.0,
        top_k: int = 50,
        top_p: float = 1.0
    ):
        """
        Initialize Chronos forecaster.

        Args:
            model_name: Model repo name (default: amazon/chronos-t5-base)
            device: "cuda" | "cpu" | None (auto-detect)
            prediction_length: Number of future days to predict
            num_samples: Number of sample trajectories to generate
            temperature: Sampling temperature (higher = more random)
            top_k: Top-k sampling parameter
            top_p: Nucleus sampling parameter
        """
        logger.info(f"Initializing ChronosModel: {model_name}")
        
        # Device setup
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        logger.info(f"Using device: {self.device}")
        
        # Load Chronos pipeline
        try:
            from chronos import ChronosPipeline
            
            # Use 'dtype' instead of 'torch_dtype' (newer API)
            try:
                self.pipeline = ChronosPipeline.from_pretrained(
                    model_name,
                    device_map=self.device,
                    dtype=torch.bfloat16 if self.device == "cuda" else torch.float32,
                )
            except TypeError:
                # Fallback for older API
                self.pipeline = ChronosPipeline.from_pretrained(
                    model_name,
                    device_map=self.device,
                    torch_dtype=torch.bfloat16 if self.device == "cuda" else torch.float32,
                )
            logger.info("✓ Chronos pipeline loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load Chronos model: {e}")
            raise
        
        # Store configuration
        self.model_name = model_name
        self.prediction_length = prediction_length
        self.num_samples = num_samples
        self.temperature = temperature
        self.top_k = top_k
        self.top_p = top_p
        
        logger.info(f"Configuration: pred_length={prediction_length}, samples={num_samples}")

    def prepare_input(self, context_tensor: torch.Tensor) -> List[torch.Tensor]:
        """
        Converts multivariate tensor (T, F) into list of F univariate series.
        
        Chronos-T5 is trained primarily on univariate time series, so we
        forecast each feature independently and combine results.
        
        Args:
            context_tensor: Shape [T, F] where T=timesteps, F=features
        
        Returns:
            List[torch.Tensor]: List of F tensors, each shape [T]
        """
        if context_tensor.dim() != 2:
            raise ValueError(f"Expected 2D tensor (T, F), got shape {context_tensor.shape}")
        
        T, F = context_tensor.shape
        logger.info(f"Preparing input: {T} timesteps × {F} features")
        
        # Split into individual feature time series
        feature_series = [context_tensor[:, i] for i in range(F)]
        
        return feature_series

    def predict_feature(self, feature_series: torch.Tensor) -> np.ndarray:
        """
        Generate forecast for a single feature time series.
        
        Args:
            feature_series: Shape [T] - single feature over time
        
        Returns:
            np.ndarray: Shape [num_samples, prediction_length]
        """
        # Generate forecast - context is passed as first positional argument
        forecast = self.pipeline.predict(
            feature_series,  # Context as first argument (not keyword)
            self.prediction_length,
            num_samples=self.num_samples,
            temperature=self.temperature,
            top_k=self.top_k,
            top_p=self.top_p,
        )
        
        # forecast shape: [num_series=1, num_samples, prediction_length]
        # Extract and convert to numpy
        forecast_np = forecast[0].cpu().numpy()  # [num_samples, prediction_length]
        
        return forecast_np

    def predict(self, context_tensor: torch.Tensor) -> Dict[str, np.ndarray]:
        """
        Generate forecasts for all features in the multivariate tensor.
        
        Args:
            context_tensor: Shape [T, F] - normalized feature matrix
        
        Returns:
            Dict with:
                - "median": [prediction_length, F] median forecast
                - "mean": [prediction_length, F] mean forecast
                - "low": [prediction_length, F] 10th percentile
                - "high": [prediction_length, F] 90th percentile
                - "samples": [num_samples, prediction_length, F] all samples
        """
        logger.info("Starting multivariate prediction...")
        
        self.pipeline.model.eval()
        
        # Prepare input (split into univariate series)
        feature_series_list = self.prepare_input(context_tensor)
        F = len(feature_series_list)
        
        # Store predictions for each feature
        all_predictions = []
        
        with torch.no_grad():
            for i, feature_series in enumerate(feature_series_list):
                if (i + 1) % 10 == 0:
                    logger.info(f"  Forecasting feature {i+1}/{F}...")
                
                # Predict this feature
                feature_forecast = self.predict_feature(feature_series)
                all_predictions.append(feature_forecast)
        
        # Stack: [F, num_samples, prediction_length] → [num_samples, prediction_length, F]
        all_predictions = np.stack(all_predictions, axis=-1)
        
        logger.info(f"✓ Generated forecasts: shape {all_predictions.shape}")
        
        # Compute summary statistics across samples
        results = {
            "median": np.median(all_predictions, axis=0),  # [prediction_length, F]
            "mean": np.mean(all_predictions, axis=0),
            "low": np.percentile(all_predictions, 10, axis=0),
            "high": np.percentile(all_predictions, 90, axis=0),
            "samples": all_predictions  # Full distribution
        }
        
        return results

    def denormalize_forecast(
        self, 
        predictions: np.ndarray, 
        norm_params: Dict[str, Tuple[float, float]],
        feature_names: List[str]
    ) -> np.ndarray:
        """
        Applies stored mean/std normalization params to bring predictions
        back to their real nutritional scale.
        
        Args:
            predictions: Shape [prediction_length, F] normalized predictions
            norm_params: Dict mapping feature_name → (mean, std)
            feature_names: Ordered list of feature names matching columns
        
        Returns:
            np.ndarray: Denormalized predictions in original scale
        """
        if not norm_params:
            logger.warning("No normalization parameters provided. Returning as-is.")
            return predictions
        
        denormalized = predictions.copy()
        
        for i, feature_name in enumerate(feature_names):
            if feature_name in norm_params:
                mean, std = norm_params[feature_name]
                
                # Reverse z-score: x = z * std + mean
                if i < predictions.shape[1]:
                    denormalized[:, i] = predictions[:, i] * std + mean
            else:
                logger.warning(f"No norm params for feature: {feature_name}")
        
        logger.info(f"Denormalized {len(feature_names)} features")
        
        return denormalized

    def to_dataframe(
        self, 
        predictions: np.ndarray, 
        feature_names: List[str], 
        start_date: date
    ) -> pd.DataFrame:
        """
        Builds a DataFrame aligned with future dates for easy insight generation.
        
        Args:
            predictions: Shape [prediction_length, F]
            feature_names: List of feature column names
            start_date: Starting date (forecasts begin day after)
        
        Returns:
            pd.DataFrame: Index = future dates, Columns = features
        """
        future_dates = pd.date_range(
            start_date + timedelta(days=1), 
            periods=self.prediction_length
        )
        
        df = pd.DataFrame(
            predictions,
            index=future_dates,
            columns=feature_names
        )
        
        logger.info(f"Created forecast DataFrame: {df.shape}")
        
        return df

    def get_forecast(
        self,
        context_tensor: torch.Tensor,
        feature_names: List[str],
        norm_params: Dict[str, Tuple[float, float]],
        start_date: date,
        return_type: str = "median"
    ) -> Dict[str, Any]:
        """
        Full pipeline wrapper for generating and formatting forecasts.
        
        Args:
            context_tensor: Shape [T, F] - normalized feature matrix
            feature_names: Ordered list of feature names
            norm_params: Normalization parameters from FeatureBuilder
            start_date: Date of last historical data point
            return_type: Which forecast to return - "median", "mean", "low", "high"
        
        Returns:
            Dict containing:
                - "forecast": List of dicts with predictions per day
                - "forecast_df": Dict representation of DataFrame
                - "start_date": Starting date (last historical point)
                - "end_date": Final forecast date
                - "prediction_length": Number of forecast days
                - "num_features": Number of features forecasted
                - "shape": Tuple of (days, features)
        """
        logger.info("="*80)
        logger.info("GENERATING FORECAST")
        logger.info("="*80)
        
        # Step 1: Generate predictions (normalized)
        predictions_dict = self.predict(context_tensor)
        
        # Step 2: Select which forecast to use
        if return_type not in predictions_dict:
            logger.warning(f"Invalid return_type '{return_type}', using 'median'")
            return_type = "median"
        
        predictions_norm = predictions_dict[return_type]
        
        # Step 3: Denormalize to real scale
        predictions_real = self.denormalize_forecast(
            predictions_norm, 
            norm_params, 
            feature_names
        )
        
        # Step 4: Create DataFrame
        forecast_df = self.to_dataframe(predictions_real, feature_names, start_date)
        
        # Step 5: Format output
        forecast_dict = forecast_df.to_dict(orient="records")
        
        # Add date strings to each record
        for i, record in enumerate(forecast_dict):
            record['date'] = str(forecast_df.index[i].date())
        
        result = {
            "forecast": forecast_dict,
            "forecast_df": forecast_df.to_dict(),
            "start_date": str(start_date),
            "end_date": str(forecast_df.index[-1].date()),
            "prediction_length": self.prediction_length,
            "num_features": len(feature_names),
            "shape": predictions_real.shape,
            "return_type": return_type
        }
        
        logger.info(f"✓ Forecast complete: {result['start_date']} → {result['end_date']}")
        logger.info("="*80)
        
        return result

    def get_multi_scenario_forecast(
        self,
        context_tensor: torch.Tensor,
        feature_names: List[str],
        norm_params: Dict[str, Tuple[float, float]],
        start_date: date
    ) -> Dict[str, Any]:
        """
        Generate multiple forecast scenarios (low/median/high) for uncertainty quantification.
        
        Returns:
            Dict with "low", "median", "high" scenario forecasts
        """
        logger.info("Generating multi-scenario forecast...")
        
        # Generate all predictions
        predictions_dict = self.predict(context_tensor)
        
        scenarios = {}
        
        for scenario_name in ["low", "median", "high"]:
            predictions_norm = predictions_dict[scenario_name]
            predictions_real = self.denormalize_forecast(
                predictions_norm, 
                norm_params, 
                feature_names
            )
            forecast_df = self.to_dataframe(predictions_real, feature_names, start_date)
            
            scenarios[scenario_name] = {
                "forecast": forecast_df.to_dict(orient="records"),
                "df": forecast_df
            }
        
        logger.info("✓ Multi-scenario forecast complete")
        
        return {
            "scenarios": scenarios,
            "start_date": str(start_date),
            "end_date": str(scenarios["median"]["df"].index[-1].date()),
            "prediction_length": self.prediction_length
        }


# Testing and example usage
def Test():
    """
    Test ChronosModel with real data from FeatureBuilder.
    """
    from datetime import date, timedelta
    
    # Import dependencies
    try:
        from Engines.Analysis.DataExtractor import DataExtractor
        from Engines.Analysis.FeatureBuilder import FeatureBuilder
    except ImportError:
        logger.error("Cannot import DataExtractor or FeatureBuilder")
        logger.error("Make sure you're running from the correct directory")
        return
    
    print("\n" + "="*80)
    print("CHRONOS MODEL - TEST RUN")
    print("="*80)
    
    # Test user
    username = "KwpGnNMQiYYaN3RY5qDT9xIsWZ33"
    print(f"User: {username}")
    print("="*80 + "\n")
    
    # Step 1: Extract raw data
    print("[STEP 1] Extracting raw data (60 days)...")
    extractor = DataExtractor(username)
    end_date = date.today()
    start_date = end_date - timedelta(days=60)
    raw_data = extractor.build_raw_data(start_date, end_date)
    print(f"✓ Extracted {len(raw_data)} days of raw data\n")
    
    # Step 2: Build feature matrix
    print("[STEP 2] Building normalized feature matrix...")
    builder = FeatureBuilder(normalize=True, window_days=7)
    context_tensor = builder.build_feature_matrix(raw_data, context_length=30)
    print(f"✓ Context tensor shape: {context_tensor.shape}")
    print(f"✓ Feature count: {len(builder.feature_columns)}\n")
    
    # Step 3: Initialize Chronos model
    print("[STEP 3] Initializing Chronos model...")
    model = ChronosModel(
        model_name="amazon/chronos-t5-base",
        prediction_length=7,
        num_samples=20
    )
    print("✓ Model loaded\n")
    
    # Step 4: Generate forecast
    print("[STEP 4] Generating 7-day forecast...")
    forecast_result = model.get_forecast(
        context_tensor=context_tensor,
        feature_names=builder.feature_columns,
        norm_params=builder.norm_params,
        start_date=end_date,
        return_type="median"
    )
    
    print(f"✓ Forecast generated: {forecast_result['start_date']} → {forecast_result['end_date']}")
    print(f"✓ Shape: {forecast_result['shape']}\n")
    
    # Step 5: Display sample predictions
    print("[STEP 5] Sample forecast values (first 3 days, first 5 features):")
    for i, day_forecast in enumerate(forecast_result['forecast'][:3]):
        print(f"\n  {day_forecast['date']}:")
        feature_sample = list(day_forecast.items())[1:6]  # Skip date, take first 5 features
        for feat_name, value in feature_sample:
            print(f"    {feat_name}: {value:.2f}")
    
    print("\n" + "="*80)
    print("FORECAST GENERATION COMPLETE")
    print("="*80)
    
    # Step 6: Export sample JSON
    print("\n[STEP 6] Sample JSON output:")
    sample_output = {
        "forecast_summary": {
            "start_date": forecast_result['start_date'],
            "end_date": forecast_result['end_date'],
            "prediction_length": forecast_result['prediction_length'],
            "num_features": forecast_result['num_features']
        },
        "sample_day": forecast_result['forecast'][0]
    }
    print(json.dumps(sample_output, indent=2))
    
    print("\n✓ ChronosModel test complete!")
    print("✓ Ready for Module 4 (InsightEngine)")


if __name__ == "__main__":
    Test()