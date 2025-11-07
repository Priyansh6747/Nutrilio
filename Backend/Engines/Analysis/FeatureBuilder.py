"""
FeatureBuilder.py - Module 2 of Habit Analysis Pipeline

Purpose:
    To convert the raw, daily-level nutrition and engagement data from DataExtractor 
    into a structured, Chronos-compatible, and information-rich feature matrix.

    This is the step where we move from:
    "Daily calories, macros, water intake"
    →
    "Feature-enriched, normalized time series with rolling stats and variability"

Responsibilities:
    - DataFrame Construction: Converts raw daily dicts → chronological DataFrame
    - Feature Enrichment: Adds rolling averages, variability, ratios, and trend features
    - Normalization: Optionally normalizes numeric columns
    - Missing Data Handling: Fills or interpolates missing values
    - Chronos Prep: Outputs torch tensor or numpy array slices ready for model input
"""

import pandas as pd
import numpy as np
import torch
from typing import Dict, List, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureBuilder:
    """
    Builds a clean, enriched multivariate feature matrix
    from extracted nutrition and engagement data.
    """

    def __init__(self, normalize: bool = True, window_days: int = 7):
        """
        Initialize feature builder.
        
        Args:
            normalize (bool): Whether to normalize features using z-score normalization.
            window_days (int): Rolling window size for variability metrics (default 7).
        """
        self.normalize = normalize
        self.window_days = window_days
        self.norm_params = {}  # Stores (mean, std) for each feature
        self.feature_columns = []  # Stores column names after building
        
        logger.info(f"FeatureBuilder initialized: normalize={normalize}, window={window_days}")

    def build_dataframe(self, raw_data: List[Dict]) -> pd.DataFrame:
        """
        Converts the raw JSON-like list (from DataExtractor) into a structured pandas.DataFrame.
        
        Args:
            raw_data (List[Dict]): List of daily records from DataExtractor.
                                   Example:
                                   [
                                       {"date": "2025-10-08", "calories": 0.0, "protein_g": 0.0, ...},
                                       {"date": "2025-10-09", "calories": 512.9, "protein_g": 12.2, ...}
                                   ]
        
        Returns:
            pd.DataFrame: Time-indexed DataFrame with all daily metrics.
                          Index: DatetimeIndex
                          Columns: All numeric features from raw_data
        """
        if not raw_data:
            logger.warning("Empty raw_data provided to build_dataframe")
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(raw_data)
        
        # Parse date column as datetime and set as index
        df['date'] = pd.to_datetime(df['date'])
        df = df.set_index('date')
        
        # Sort chronologically
        df = df.sort_index()
        
        # Fill any remaining NaN values with 0
        df = df.fillna(0)
        
        # Ensure all numeric columns are float type
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64', 'int32', 'float32']:
                df[col] = df[col].astype(float)
        
        logger.info(f"Built DataFrame: {len(df)} days, {len(df.columns)} base features")
        
        return df

    def add_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Adds temporal dynamics (rolling means, stds, variability) to detect patterns.
        
        Features Added:
            - Rolling means: {col}_roll_mean_{window}d
            - Rolling stds: {col}_roll_std_{window}d
            - Coefficient of variation: {col}_variability (std/mean)
        
        Args:
            df (pd.DataFrame): Base DataFrame from build_dataframe.
        
        Returns:
            pd.DataFrame: Enhanced DataFrame with rolling features.
        """
        if df.empty:
            return df
        
        # Define key columns to create rolling features for
        rolling_cols = [
            'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
            'meal_count', 'water_intake_ml'
        ]
        
        # Filter to only existing columns
        rolling_cols = [col for col in rolling_cols if col in df.columns]
        
        new_features_count = 0
        
        for col in rolling_cols:
            # Rolling mean
            roll_mean_col = f"{col}_roll_mean_{self.window_days}d"
            df[roll_mean_col] = df[col].rolling(
                window=self.window_days, 
                min_periods=1
            ).mean()
            
            # Rolling standard deviation
            roll_std_col = f"{col}_roll_std_{self.window_days}d"
            df[roll_std_col] = df[col].rolling(
                window=self.window_days, 
                min_periods=1
            ).std().fillna(0)
            
            # Coefficient of variation (normalized variability)
            variability_col = f"{col}_variability"
            df[variability_col] = df[roll_std_col] / (df[roll_mean_col] + 1e-8)
            df[variability_col] = df[variability_col].fillna(0)
            
            new_features_count += 3
        
        logger.info(f"Added {new_features_count} rolling features (window={self.window_days}d)")
        
        return df

    def add_ratio_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Creates meaningful macro ratios that capture diet balance and habit consistency.
        
        Features Added:
            - protein_to_calories: Protein contribution to total calories
            - fat_to_calories: Fat contribution to total calories
            - carb_to_calories: Carb contribution to total calories
            - protein_to_fat_ratio: Balance between protein and fat
            - protein_to_carb_ratio: Balance between protein and carbs
            - macro_balance: Overall diet balance metric
            - water_to_meal_ratio: Hydration per meal logged
        
        Args:
            df (pd.DataFrame): DataFrame with rolling features added.
        
        Returns:
            pd.DataFrame: Enhanced DataFrame with ratio features.
        """
        if df.empty:
            return df
        
        new_features_count = 0
        
        # Macronutrient to calorie ratios (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
        if all(col in df.columns for col in ['protein_g', 'calories']):
            df['protein_to_calories'] = (df['protein_g'] * 4) / (df['calories'] + 1e-8)
            df['protein_to_calories'] = df['protein_to_calories'].fillna(0).clip(0, 1)
            new_features_count += 1
        
        if all(col in df.columns for col in ['fat_g', 'calories']):
            df['fat_to_calories'] = (df['fat_g'] * 9) / (df['calories'] + 1e-8)
            df['fat_to_calories'] = df['fat_to_calories'].fillna(0).clip(0, 1)
            new_features_count += 1
        
        if all(col in df.columns for col in ['carbs_g', 'calories']):
            df['carb_to_calories'] = (df['carbs_g'] * 4) / (df['calories'] + 1e-8)
            df['carb_to_calories'] = df['carb_to_calories'].fillna(0).clip(0, 1)
            new_features_count += 1
        
        # Macronutrient balance ratios
        if all(col in df.columns for col in ['protein_g', 'fat_g']):
            df['protein_to_fat_ratio'] = df['protein_g'] / (df['fat_g'] + 1e-8)
            df['protein_to_fat_ratio'] = df['protein_to_fat_ratio'].fillna(0).clip(0, 10)
            new_features_count += 1
        
        if all(col in df.columns for col in ['protein_g', 'carbs_g']):
            df['protein_to_carb_ratio'] = df['protein_g'] / (df['carbs_g'] + 1e-8)
            df['protein_to_carb_ratio'] = df['protein_to_carb_ratio'].fillna(0).clip(0, 10)
            new_features_count += 1
        
        # Overall macro balance (how close to equal distribution)
        if all(col in df.columns for col in ['protein_g', 'carbs_g', 'fat_g']):
            total_macros = df['protein_g'] + df['carbs_g'] + df['fat_g'] + 1e-8
            p_pct = df['protein_g'] / total_macros
            c_pct = df['carbs_g'] / total_macros
            f_pct = df['fat_g'] / total_macros
            
            # Standard deviation of macro percentages (lower = more balanced)
            df['macro_balance'] = np.sqrt(
                ((p_pct - 0.33)**2 + (c_pct - 0.33)**2 + (f_pct - 0.33)**2) / 3
            )
            df['macro_balance'] = df['macro_balance'].fillna(0)
            new_features_count += 1
        
        # Hydration to meal ratio
        if all(col in df.columns for col in ['water_intake_ml', 'meal_count']):
            df['water_to_meal_ratio'] = df['water_intake_ml'] / (df['meal_count'] + 1e-8)
            df['water_to_meal_ratio'] = df['water_to_meal_ratio'].fillna(0)
            new_features_count += 1
        
        # Fiber to carb ratio (dietary quality indicator)
        if all(col in df.columns for col in ['fiber_g', 'carbs_g']):
            df['fiber_to_carb_ratio'] = df['fiber_g'] / (df['carbs_g'] + 1e-8)
            df['fiber_to_carb_ratio'] = df['fiber_to_carb_ratio'].fillna(0).clip(0, 1)
            new_features_count += 1
        
        # Calorie density per meal
        if all(col in df.columns for col in ['calories', 'meal_count']):
            df['calories_per_meal'] = df['calories'] / (df['meal_count'] + 1e-8)
            df['calories_per_meal'] = df['calories_per_meal'].fillna(0)
            new_features_count += 1
        
        logger.info(f"Added {new_features_count} ratio features")
        
        return df

    def normalize_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Optionally normalizes all numeric columns using z-score normalization.
        
        Formula: z = (x - mean) / std
        
        Stores normalization parameters in self.norm_params for later denormalization.
        
        Args:
            df (pd.DataFrame): DataFrame with all features added.
        
        Returns:
            pd.DataFrame: Normalized DataFrame.
        """
        if df.empty:
            return df
        
        self.norm_params = {}
        
        for col in df.columns:
            if df[col].dtype in ['float64', 'float32', 'int64', 'int32']:
                mean = df[col].mean()
                std = df[col].std()
                
                # Store parameters
                self.norm_params[col] = (mean, std)
                
                # Normalize
                if std > 1e-8:  # Avoid division by zero
                    df[col] = (df[col] - mean) / std
                else:
                    df[col] = 0.0
        
        logger.info(f"Normalized {len(self.norm_params)} features")
        
        return df

    def build_feature_matrix(
        self, 
        raw_data: List[Dict], 
        context_length: Optional[int] = 30
    ) -> torch.Tensor:
        """
        Main pipeline wrapper: takes raw extracted data → builds full Chronos-ready tensor.
        
        Pipeline Steps:
            1. df = build_dataframe(raw_data)
            2. df = add_rolling_features(df)
            3. df = add_ratio_features(df)
            4. If self.normalize: df = normalize_features(df)
            5. Select last context_length days
            6. Convert to torch.Tensor
        
        Args:
            raw_data (List[Dict]): Raw daily data from DataExtractor.
            context_length (Optional[int]): Number of recent days to include. 
                                           If None, include all data.
        
        Returns:
            torch.Tensor: Shape [context_length, num_features]
                         Ready for Chronos model input.
        """
        logger.info(f"Building feature matrix with context_length={context_length}")
        
        # Step 1: Build base DataFrame
        df = self.build_dataframe(raw_data)
        
        if df.empty:
            logger.warning("Empty DataFrame after build_dataframe")
            return torch.tensor([])
        
        # Step 2: Add rolling features
        df = self.add_rolling_features(df)
        
        # Step 3: Add ratio features
        df = self.add_ratio_features(df)
        
        # Step 4: Normalize if requested
        if self.normalize:
            df = self.normalize_features(df)
        
        # Store feature column names
        self.feature_columns = list(df.columns)
        
        # Step 5: Select last context_length days
        if context_length is not None and len(df) > context_length:
            df = df.iloc[-context_length:]
            logger.info(f"Selected last {context_length} days from {len(df)} total")
        
        # Step 6: Convert to torch tensor
        feature_matrix = torch.tensor(df.values, dtype=torch.float32)
        
        logger.info(f"Final feature matrix shape: {feature_matrix.shape}")
        logger.info(f"Total features: {len(self.feature_columns)}")
        
        return feature_matrix

    def denormalize(self, predictions: np.ndarray, feature_names: Optional[List[str]] = None) -> np.ndarray:
        """
        Reverts normalized predictions back to original scale.
        
        Args:
            predictions (np.ndarray): Normalized predictions. Shape [n_samples, n_features]
            feature_names (Optional[List[str]]): Names of features to denormalize.
                                                If None, uses all stored norm_params.
        
        Returns:
            np.ndarray: Denormalized predictions in original scale.
        """
        if not self.norm_params:
            logger.warning("No normalization parameters stored. Returning predictions as-is.")
            return predictions
        
        denormalized = predictions.copy()
        
        # If feature names provided, use them; otherwise use all
        if feature_names is None:
            feature_names = list(self.norm_params.keys())
        
        for i, col in enumerate(feature_names):
            if col in self.norm_params:
                mean, std = self.norm_params[col]
                if i < predictions.shape[1]:
                    denormalized[:, i] = predictions[:, i] * std + mean
        
        logger.info(f"Denormalized {len(feature_names)} features")
        
        return denormalized

    def get_feature_summary(self) -> Dict:
        """
        Returns summary information about the built features.
        
        Returns:
            Dict: Summary containing:
                - total_features: Total number of features
                - feature_names: List of all feature names
                - normalized: Whether features are normalized
                - window_days: Rolling window size
        """
        return {
            "total_features": len(self.feature_columns),
            "feature_names": self.feature_columns,
            "normalized": self.normalize,
            "window_days": self.window_days,
            "has_norm_params": bool(self.norm_params)
        }


# Example usage and testing
def Test():
    from datetime import date, timedelta
    
    # Import DataExtractor (assuming it's in the same package)
    try:
        from Engines.Analysis.DataExtractor import DataExtractor
    except ImportError:
        # Fallback for testing
        import sys
        sys.path.append('..')
        from DataExtractor import DataExtractor

    print("\n" + "="*80)
    print("FEATURE BUILDER - TEST RUN")
    print("="*80)
    
    # Initialize with test user
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
    
    # Step 2: Build features (normalized)
    print("[STEP 2] Building feature matrix (normalized)...")
    builder_norm = FeatureBuilder(normalize=True, window_days=7)
    feature_matrix_norm = builder_norm.build_feature_matrix(raw_data, context_length=30)
    
    print(f"✓ Feature matrix shape: {feature_matrix_norm.shape}")
    print(f"  - Context length: {feature_matrix_norm.shape[0]} days")
    print(f"  - Total features: {feature_matrix_norm.shape[1]}\n")
    
    # Step 3: Build features (non-normalized)
    print("[STEP 3] Building feature matrix (non-normalized)...")
    builder_raw = FeatureBuilder(normalize=False, window_days=7)
    feature_matrix_raw = builder_raw.build_feature_matrix(raw_data, context_length=30)
    
    print(f"✓ Feature matrix shape: {feature_matrix_raw.shape}\n")
    
    # Step 4: Feature summary
    print("[STEP 4] Feature summary...")
    summary = builder_norm.get_feature_summary()
    print(f"✓ Total features: {summary['total_features']}")
    print(f"✓ Normalized: {summary['normalized']}")
    print(f"✓ Rolling window: {summary['window_days']} days")
    print(f"✓ Normalization params stored: {summary['has_norm_params']}\n")
    
    # Step 5: Show sample features
    print("[STEP 5] Sample feature names (first 20):")
    for i, name in enumerate(summary['feature_names'][:20], 1):
        print(f"  {i:2d}. {name}")
    
    if len(summary['feature_names']) > 20:
        print(f"  ... and {len(summary['feature_names']) - 20} more features\n")
    
    # Step 6: Test denormalization
    print("[STEP 6] Testing denormalization...")
    # Create dummy predictions
    dummy_predictions = np.random.randn(5, feature_matrix_norm.shape[1])
    denormalized = builder_norm.denormalize(dummy_predictions)
    print(f"✓ Denormalized shape: {denormalized.shape}")
    print(f"  Original range: [{dummy_predictions.min():.2f}, {dummy_predictions.max():.2f}]")
    print(f"  Denormalized range: [{denormalized.min():.2f}, {denormalized.max():.2f}]\n")
    
    # Step 7: Show actual values comparison
    print("[STEP 7] Sample comparison (last day):")
    print("  Normalized values (first 5 features):")
    for i, name in enumerate(summary['feature_names'][:5]):
        print(f"    {name}: {feature_matrix_norm[-1, i].item():.4f}")
    
    print("\n  Raw values (first 5 features):")
    for i, name in enumerate(builder_raw.feature_columns[:5]):
        print(f"    {name}: {feature_matrix_raw[-1, i].item():.4f}")
    
    print("\n" + "="*80)
    print("FEATURE ENGINEERING COMPLETE")
    print("="*80)
    print(f"\n✓ Ready for Chronos model input!")
    print(f"✓ Input shape: {feature_matrix_norm.shape}")
    print(f"✓ Dtype: {feature_matrix_norm.dtype}")