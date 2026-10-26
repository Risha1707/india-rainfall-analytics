"""
01_preprocess_and_clean.py
Author: Senior Data Scientist
Description:
    Comprehensive preprocessing, cleaning, outlier analysis, and feature engineering
    for the official India Meteorological Department (IMD) 1901-2015 rainfall dataset
    sourced from the Open Government Data (data.gov.in) portal.
"""

import os
import json
import numpy as np
import pandas as pd

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_path = os.path.join(base_dir, 'data', 'rainfall_india_1901_2015_raw.csv')
    cleaned_path = os.path.join(base_dir, 'data', 'rainfall_india_1901_2015_cleaned.csv')
    features_path = os.path.join(base_dir, 'data', 'rainfall_india_features.csv')
    metadata_path = os.path.join(base_dir, 'data', 'dataset_metadata.json')

    print(f"Loading raw dataset from: {raw_path}")
    df = pd.read_csv(raw_path)

    # 1. Inspect Schema and Initial Properties
    raw_shape = df.shape
    print(f"Initial raw shape: {raw_shape[0]} rows, {raw_shape[1]} columns")

    # Clean whitespace in column names
    df.columns = [c.strip() for c in df.columns]

    # Clean whitespace in string columns
    df['SUBDIVISION'] = df['SUBDIVISION'].astype(str).str.strip()

    # Standardize known historical typo in IMD records
    df['SUBDIVISION'] = df['SUBDIVISION'].replace({'MATATHWADA': 'MARATHWADA'})

    # 2. Check for Duplicates
    dup_count = int(df.duplicated(subset=['SUBDIVISION', 'YEAR']).sum())
    print(f"Duplicate rows detected (SUBDIVISION + YEAR): {dup_count}")
    if dup_count > 0:
        df = df.drop_duplicates(subset=['SUBDIVISION', 'YEAR'])

    # 3. Analyze Missing Values
    months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    seasonal_cols = ['Jan-Feb', 'Mar-May', 'Jun-Sep', 'Oct-Dec', 'ANNUAL']

    missing_report_before = {}
    for col in months + seasonal_cols:
        missing_report_before[col] = int(df[col].isnull().sum())
    print("Missing values before imputation:")
    print({k: v for k, v in missing_report_before.items() if v > 0})

    # Impute missing monthly values using subdivision-specific median
    # (Median is resistant to extreme cloudburst or cyclone outliers)
    imputed_records_count = 0
    for month in months:
        for sub in df['SUBDIVISION'].unique():
            mask = (df['SUBDIVISION'] == sub) & (df[month].isnull())
            null_count = mask.sum()
            if null_count > 0:
                sub_median = df.loc[df['SUBDIVISION'] == sub, month].median()
                if pd.isna(sub_median):
                    sub_median = df[month].median()
                df.loc[mask, month] = round(sub_median, 2)
                imputed_records_count += null_count

    print(f"Total individual monthly values imputed: {imputed_records_count}")

    # 4. Mathematically Reconcile Seasonal Aggregations
    # Ensure zero discrepancy between monthly values and seasonal totals
    df['Jan-Feb'] = (df['JAN'] + df['FEB']).round(2)
    df['Mar-May'] = (df['MAR'] + df['APR'] + df['MAY']).round(2)
    df['Jun-Sep'] = (df['JUN'] + df['JUL'] + df['AUG'] + df['SEP']).round(2)
    df['Oct-Dec'] = (df['OCT'] + df['NOV'] + df['DEC']).round(2)
    df['ANNUAL'] = (df['Jan-Feb'] + df['Mar-May'] + df['Jun-Sep'] + df['Oct-Dec']).round(2)

    # Verify no nulls remain in meteorological columns
    assert df[months + seasonal_cols].isnull().sum().sum() == 0, "Nulls remain in cleaned data!"

    # 5. Outlier Analysis (Subdivision-Wise IQR & Z-Score)
    # India has dramatic geographic variability (e.g. Rajasthan 290mm vs Coastal Karnataka 3400mm).
    # Evaluating outliers must be subdivision-specific.
    outlier_iqr_flags = []
    outlier_z_flags = []

    subdivision_baselines = {}

    for sub in df['SUBDIVISION'].unique():
        sub_mask = df['SUBDIVISION'] == sub
        sub_annual = df.loc[sub_mask, 'ANNUAL']
        q25 = sub_annual.quantile(0.25)
        q75 = sub_annual.quantile(0.75)
        iqr = q75 - q25
        lower_iqr = q25 - 1.5 * iqr
        upper_iqr = q75 + 1.5 * iqr

        mean_val = sub_annual.mean()
        std_val = sub_annual.std() if sub_annual.std() > 0 else 1.0

        subdivision_baselines[sub] = {
            "mean_annual": round(float(mean_val), 2),
            "std_annual": round(float(std_val), 2),
            "median_annual": round(float(sub_annual.median()), 2),
            "min_annual": round(float(sub_annual.min()), 2),
            "max_annual": round(float(sub_annual.max()), 2),
            "mean_monsoon": round(float(df.loc[sub_mask, 'Jun-Sep'].mean()), 2),
            "std_monsoon": round(float(df.loc[sub_mask, 'Jun-Sep'].std()), 2)
        }

    # Add outlier indicators
    df['ANNUAL_ZSCORE'] = df.apply(
        lambda row: round((row['ANNUAL'] - subdivision_baselines[row['SUBDIVISION']]['mean_annual']) /
                          subdivision_baselines[row['SUBDIVISION']]['std_annual'], 2),
        axis=1
    )
    df['IS_ANOMALY'] = df['ANNUAL_ZSCORE'].abs() > 2.0  # Beyond 2 standard deviations

    # Sort deterministically
    df = df.sort_values(by=['SUBDIVISION', 'YEAR']).reset_index(drop=True)

    # Save Cleaned Dataset
    cleaned_columns = ['SUBDIVISION', 'YEAR'] + months + seasonal_cols
    df[cleaned_columns].to_csv(cleaned_path, index=False)
    print(f"Cleaned dataset saved to: {cleaned_path}")

    # 6. Feature Engineering for Machine Learning
    # Climate Zone Mapping
    climate_zone_map = {
        'ARUNACHAL PRADESH': 'North-East & Himalayan',
        'ASSAM & MEGHALAYA': 'North-East & Himalayan',
        'NAGA MANI MIZO TRIPURA': 'North-East & Himalayan',
        'SUB HIMALAYAN WEST BENGAL & SIKKIM': 'North-East & Himalayan',
        'HIMACHAL PRADESH': 'North-East & Himalayan',
        'UTTARAKHAND': 'North-East & Himalayan',
        'JAMMU & KASHMIR': 'North-East & Himalayan',

        'GANGETIC WEST BENGAL': 'Indo-Gangetic Plains',
        'BIHAR': 'Indo-Gangetic Plains',
        'JHARKHAND': 'Indo-Gangetic Plains',
        'EAST UTTAR PRADESH': 'Indo-Gangetic Plains',
        'WEST UTTAR PRADESH': 'Indo-Gangetic Plains',
        'PUNJAB': 'Indo-Gangetic Plains',
        'HARYANA DELHI & CHANDIGARH': 'Indo-Gangetic Plains',

        'EAST MADHYA PRADESH': 'Central & Plateau',
        'WEST MADHYA PRADESH': 'Central & Plateau',
        'CHHATTISGARH': 'Central & Plateau',
        'VIDARBHA': 'Central & Plateau',
        'MARATHWADA': 'Central & Plateau',
        'MADHYA MAHARASHTRA': 'Central & Plateau',
        'TELANGANA': 'Central & Plateau',

        'WEST RAJASTHAN': 'Western Arid & Semi-Arid',
        'EAST RAJASTHAN': 'Western Arid & Semi-Arid',
        'GUJARAT REGION': 'Western Arid & Semi-Arid',
        'SAURASHTRA & KUTCH': 'Western Arid & Semi-Arid',

        'COASTAL ANDHRA PRADESH': 'Peninsular & Coastal',
        'RAYALSEEMA': 'Peninsular & Coastal',
        'TAMIL NADU': 'Peninsular & Coastal',
        'COASTAL KARNATAKA': 'Peninsular & Coastal',
        'NORTH INTERIOR KARNATAKA': 'Peninsular & Coastal',
        'SOUTH INTERIOR KARNATAKA': 'Peninsular & Coastal',
        'KERALA': 'Peninsular & Coastal',
        'KONKAN & GOA': 'Peninsular & Coastal',
        'ORISSA': 'Peninsular & Coastal',
        'ANDAMAN & NICOBAR ISLANDS': 'Peninsular & Coastal',
        'LAKSHADWEEP': 'Peninsular & Coastal'
    }

    df_feat = df.copy()
    df_feat['CLIMATE_ZONE'] = df_feat['SUBDIVISION'].map(climate_zone_map)

    # Long Period Average (LPA) Departure
    df_feat['SUBDIVISION_LPA_MONSOON'] = df_feat['SUBDIVISION'].apply(
        lambda s: subdivision_baselines[s]['mean_monsoon']
    )
    df_feat['SUBDIVISION_LPA_ANNUAL'] = df_feat['SUBDIVISION'].apply(
        lambda s: subdivision_baselines[s]['mean_annual']
    )

    df_feat['MONSOON_DEPARTURE_PCT'] = (
        (df_feat['Jun-Sep'] - df_feat['SUBDIVISION_LPA_MONSOON']) / df_feat['SUBDIVISION_LPA_MONSOON'] * 100
    ).round(2)

    df_feat['ANNUAL_DEPARTURE_PCT'] = (
        (df_feat['ANNUAL'] - df_feat['SUBDIVISION_LPA_ANNUAL']) / df_feat['SUBDIVISION_LPA_ANNUAL'] * 100
    ).round(2)

    # IMD Monsoon Category Classification
    # Deficient/Drought: < -10%, Normal: -10% to +10%, Excess/Flood: > +10%
    def categorize_monsoon(dep):
        if dep < -19.0:
            return 'Severe Deficit'
        elif dep < -10.0:
            return 'Deficit'
        elif dep <= 10.0:
            return 'Normal'
        elif dep <= 19.0:
            return 'Excess'
        else:
            return 'Large Excess'

    df_feat['MONSOON_CATEGORY'] = df_feat['MONSOON_DEPARTURE_PCT'].apply(categorize_monsoon)
    df_feat['MONSOON_RISK_3CLASS'] = df_feat['MONSOON_DEPARTURE_PCT'].apply(
        lambda dep: 'Deficit' if dep < -10.0 else ('Excess' if dep > 10.0 else 'Normal')
    )

    # Lag features per subdivision
    df_feat['LAG_1_MONSOON'] = df_feat.groupby('SUBDIVISION')['Jun-Sep'].shift(1)
    df_feat['LAG_1_ANNUAL'] = df_feat.groupby('SUBDIVISION')['ANNUAL'].shift(1)
    df_feat['ROLLING_3YR_MONSOON'] = df_feat.groupby('SUBDIVISION')['Jun-Sep'].transform(
        lambda s: s.rolling(3, min_periods=1).mean().round(2)
    )
    df_feat['ROLLING_5YR_MONSOON'] = df_feat.groupby('SUBDIVISION')['Jun-Sep'].transform(
        lambda s: s.rolling(5, min_periods=1).mean().round(2)
    )

    # Impute first row lag per subdivision with historical mean
    df_feat['LAG_1_MONSOON'] = df_feat['LAG_1_MONSOON'].fillna(df_feat['SUBDIVISION_LPA_MONSOON'])
    df_feat['LAG_1_ANNUAL'] = df_feat['LAG_1_ANNUAL'].fillna(df_feat['SUBDIVISION_LPA_ANNUAL'])

    # Ratios
    df_feat['MONSOON_SHARE_PCT'] = ((df_feat['Jun-Sep'] / df_feat['ANNUAL']) * 100).round(2)
    df_feat['PRE_MONSOON_RATIO'] = (df_feat['Mar-May'] / (df_feat['Jan-Feb'] + 1.0)).round(2)

    df_feat.to_csv(features_path, index=False)
    print(f"Engineered features dataset saved to: {features_path}")

    # 7. Generate Comprehensive Metadata
    metadata = {
        "dataset_name": "Rainfall in India (1901-2015) Meteorological Sub-Division Series",
        "source": "Open Government Data (OGD) Platform India (data.gov.in) & India Meteorological Department (IMD)",
        "ministry": "Ministry of Earth Sciences, Government of India",
        "portal_url": "https://data.gov.in/catalog/rainfall-statistics-india",
        "license": "Government Open Data License - India (GODL)",
        "temporal_coverage": {
            "start_year": int(df['YEAR'].min()),
            "end_year": int(df['YEAR'].max()),
            "total_years": int(df['YEAR'].max() - df['YEAR'].min() + 1)
        },
        "spatial_coverage": {
            "subdivisions_count": int(df['SUBDIVISION'].nunique()),
            "subdivisions": sorted(df['SUBDIVISION'].unique().tolist()),
            "climate_zones": sorted(list(set(climate_zone_map.values())))
        },
        "cleaning_summary": {
            "original_rows": raw_shape[0],
            "original_cols": raw_shape[1],
            "duplicates_removed": dup_count,
            "monthly_values_imputed": imputed_records_count,
            "imputation_method": "Subdivision-specific historical monthly median",
            "aggregates_reconciled": True
        },
        "subdivision_baselines": subdivision_baselines
    }

    class NpEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, np.integer):
                return int(obj)
            if isinstance(obj, np.floating):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return super(NpEncoder, self).default(obj)

    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, cls=NpEncoder)
    print(f"Metadata JSON saved to: {metadata_path}")
    print("Preprocessing and cleaning completed successfully!")

if __name__ == '__main__':
    main()
