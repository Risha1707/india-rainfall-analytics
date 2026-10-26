"""
02_exploratory_data_analysis.py
Author: Senior Data Scientist
Description:
    Conducts rigorous Exploratory Data Analysis (EDA) on cleaned IMD rainfall data,
    evaluating decadal trends, monthly seasonality, subdivision variability,
    historic drought/flood events, and correlation matrices.
    Exports structured JSON data for the interactive frontend and renders
    high-resolution analytical charts.
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer, int)):
            return int(obj)
        if isinstance(obj, (np.floating, float)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    features_path = os.path.join(base_dir, 'data', 'rainfall_india_features.csv')
    models_dir = os.path.join(base_dir, 'models')
    figures_dir = os.path.join(base_dir, 'reports', 'figures')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(figures_dir, exist_ok=True)

    print(f"Loading features data from {features_path}...")
    df = pd.read_csv(features_path)

    months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    seasonal = ['Jan-Feb', 'Mar-May', 'Jun-Sep', 'Oct-Dec', 'ANNUAL']

    # ==========================================
    # 1. Seasonal & Monthly Distribution
    # ==========================================
    monthly_stats = []
    for m in months:
        monthly_stats.append({
            "month": m,
            "mean": round(float(df[m].mean()), 2),
            "median": round(float(df[m].median()), 2),
            "std": round(float(df[m].std()), 2),
            "min": round(float(df[m].min()), 2),
            "max": round(float(df[m].max()), 2),
            "q25": round(float(df[m].quantile(0.25)), 2),
            "q75": round(float(df[m].quantile(0.75)), 2)
        })

    seasonal_share = {
        "Winter (Jan-Feb)": round(float(df['Jan-Feb'].mean() / df['ANNUAL'].mean() * 100), 2),
        "Pre-Monsoon (Mar-May)": round(float(df['Mar-May'].mean() / df['ANNUAL'].mean() * 100), 2),
        "Southwest Monsoon (Jun-Sep)": round(float(df['Jun-Sep'].mean() / df['ANNUAL'].mean() * 100), 2),
        "Post-Monsoon (Oct-Dec)": round(float(df['Oct-Dec'].mean() / df['ANNUAL'].mean() * 100), 2)
    }

    seasonal_dist = {
        "monthly_breakdown": monthly_stats,
        "seasonal_share_pct": seasonal_share,
        "overall_mean_annual": round(float(df['ANNUAL'].mean()), 2),
        "overall_mean_monsoon": round(float(df['Jun-Sep'].mean()), 2)
    }

    with open(os.path.join(models_dir, 'seasonal_distribution.json'), 'w', encoding='utf-8') as f:
        json.dump(seasonal_dist, f, indent=2, cls=NpEncoder)

    # ==========================================
    # 2. Decadal Climate Trends
    # ==========================================
    df['DECADE'] = (df['YEAR'] // 10) * 10
    df['DECADE_LABEL'] = df['DECADE'].astype(str) + "s"

    decadal_df = df.groupby('DECADE_LABEL').agg(
        mean_annual=('ANNUAL', 'mean'),
        mean_monsoon=('Jun-Sep', 'mean'),
        std_annual=('ANNUAL', 'std'),
        record_count=('YEAR', 'count'),
        drought_count=('MONSOON_RISK_3CLASS', lambda s: int((s == 'Deficit').sum())),
        excess_count=('MONSOON_RISK_3CLASS', lambda s: int((s == 'Excess').sum())),
        normal_count=('MONSOON_RISK_3CLASS', lambda s: int((s == 'Normal').sum()))
    ).reset_index()

    # Sort decadal order
    decadal_df = decadal_df.sort_values('DECADE_LABEL')
    decadal_records = []
    for _, row in decadal_df.iterrows():
        decadal_records.append({
            "decade": row['DECADE_LABEL'],
            "mean_annual": round(float(row['mean_annual']), 2),
            "mean_monsoon": round(float(row['mean_monsoon']), 2),
            "std_annual": round(float(row['std_annual']), 2),
            "drought_pct": round(float(row['drought_count'] / row['record_count'] * 100), 2),
            "excess_pct": round(float(row['excess_count'] / row['record_count'] * 100), 2),
            "normal_pct": round(float(row['normal_count'] / row['record_count'] * 100), 2)
        })

    with open(os.path.join(models_dir, 'decadal_trends.json'), 'w', encoding='utf-8') as f:
        json.dump(decadal_records, f, indent=2, cls=NpEncoder)

    # ==========================================
    # 3. Subdivision Comprehensive Stats
    # ==========================================
    sub_list = sorted(df['SUBDIVISION'].unique().tolist())
    sub_data = {}

    for sub in sub_list:
        sub_df = df[df['SUBDIVISION'] == sub].sort_values('YEAR')
        zone = sub_df['CLIMATE_ZONE'].iloc[0]

        # Monthly averages
        sub_monthly = {m: round(float(sub_df[m].mean()), 2) for m in months}

        # Historical extremes
        driest_year = sub_df.loc[sub_df['ANNUAL'].idxmin()]
        wettest_year = sub_df.loc[sub_df['ANNUAL'].idxmax()]

        # Recent 20-year trend (1996-2015) vs Historical baseline (1901-1970)
        recent_mean = sub_df[sub_df['YEAR'] >= 1996]['Jun-Sep'].mean()
        baseline_mean = sub_df[sub_df['YEAR'] <= 1970]['Jun-Sep'].mean()
        trend_shift_pct = round(float((recent_mean - baseline_mean) / baseline_mean * 100), 2)

        # Yearly series (for interactive charting)
        years_series = sub_df['YEAR'].tolist()
        annual_series = sub_df['ANNUAL'].round(1).tolist()
        monsoon_series = sub_df['Jun-Sep'].round(1).tolist()
        rolling5_series = sub_df['ROLLING_5YR_MONSOON'].round(1).tolist()

        sub_data[sub] = {
            "subdivision": sub,
            "climate_zone": zone,
            "years_count": len(sub_df),
            "start_year": int(sub_df['YEAR'].min()),
            "end_year": int(sub_df['YEAR'].max()),
            "mean_annual": round(float(sub_df['ANNUAL'].mean()), 2),
            "std_annual": round(float(sub_df['ANNUAL'].std()), 2),
            "cv_annual_pct": round(float((sub_df['ANNUAL'].std() / sub_df['ANNUAL'].mean()) * 100), 2),
            "mean_monsoon": round(float(sub_df['Jun-Sep'].mean()), 2),
            "std_monsoon": round(float(sub_df['Jun-Sep'].std()), 2),
            "mean_premonsoon": round(float(sub_df['Mar-May'].mean()), 2),
            "mean_winter": round(float(sub_df['Jan-Feb'].mean()), 2),
            "mean_postmonsoon": round(float(sub_df['Oct-Dec'].mean()), 2),
            "monsoon_share_pct": round(float((sub_df['Jun-Sep'].mean() / sub_df['ANNUAL'].mean()) * 100), 2),
            "wettest_year": {
                "year": int(wettest_year['YEAR']),
                "annual": round(float(wettest_year['ANNUAL']), 2),
                "monsoon": round(float(wettest_year['Jun-Sep']), 2)
            },
            "driest_year": {
                "year": int(driest_year['YEAR']),
                "annual": round(float(driest_year['ANNUAL']), 2),
                "monsoon": round(float(driest_year['Jun-Sep']), 2)
            },
            "trend_shift_pct": trend_shift_pct,
            "monthly_means": sub_monthly,
            "time_series": {
                "years": years_series,
                "annual": annual_series,
                "monsoon": monsoon_series,
                "rolling_5yr_monsoon": rolling5_series
            }
        }

    with open(os.path.join(models_dir, 'subdivision_stats.json'), 'w', encoding='utf-8') as f:
        json.dump(sub_data, f, indent=2, cls=NpEncoder)

    # ==========================================
    # 4. Correlation Analysis
    # ==========================================
    corr_cols = months + ['Jan-Feb', 'Mar-May', 'Jun-Sep', 'Oct-Dec', 'ANNUAL']
    corr_matrix = df[corr_cols].corr().round(3)
    corr_dict = {
        "columns": corr_cols,
        "matrix": corr_matrix.values.tolist()
    }

    with open(os.path.join(models_dir, 'correlation_matrix.json'), 'w', encoding='utf-8') as f:
        json.dump(corr_dict, f, indent=2, cls=NpEncoder)

    # ==========================================
    # 5. Historical All-India Extremes
    # ==========================================
    all_india_annual = df.groupby('YEAR').agg(
        national_annual=('ANNUAL', 'mean'),
        national_monsoon=('Jun-Sep', 'mean')
    ).reset_index()

    lpa_national_monsoon = all_india_annual['national_monsoon'].mean()
    all_india_annual['monsoon_departure'] = (
        (all_india_annual['national_monsoon'] - lpa_national_monsoon) / lpa_national_monsoon * 100
    ).round(2)

    top_droughts = all_india_annual.sort_values('monsoon_departure').head(10).to_dict(orient='records')
    top_floods = all_india_annual.sort_values('monsoon_departure', ascending=False).head(10).to_dict(orient='records')

    extremes_summary = {
        "lpa_national_monsoon_mm": round(float(lpa_national_monsoon), 2),
        "lpa_national_annual_mm": round(float(all_india_annual['national_annual'].mean()), 2),
        "top_historical_drought_years": top_droughts,
        "top_historical_excess_flood_years": top_floods
    }

    with open(os.path.join(models_dir, 'historical_extremes.json'), 'w', encoding='utf-8') as f:
        json.dump(extremes_summary, f, indent=2, cls=NpEncoder)

    # ==========================================
    # 6. Render Static Visualizations (Matplotlib/Seaborn)
    # ==========================================
    plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
    fig_dpi = 180

    # Fig 1: Monthly Precipitation Boxplot & Seasonality
    plt.figure(figsize=(11, 5))
    sns.boxplot(data=df[months], palette="Blues_r", showfliers=False)
    plt.title("All-India Monthly Rainfall Distribution (1901-2015) [IMD Official]", fontsize=13, weight='bold', pad=12)
    plt.ylabel("Rainfall (mm)", fontsize=11)
    plt.xlabel("Month", fontsize=11)
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, '01_monthly_distribution.png'), dpi=fig_dpi)
    plt.close()

    # Fig 2: Decadal Rainfall Trajectory
    plt.figure(figsize=(12, 5))
    x_dec = [r['decade'] for r in decadal_records]
    y_mon = [r['mean_monsoon'] for r in decadal_records]
    y_ann = [r['mean_annual'] for r in decadal_records]

    plt.plot(x_dec, y_ann, marker='o', linewidth=2.5, color='#1e40af', label='Annual Rainfall (mm)')
    plt.plot(x_dec, y_mon, marker='s', linewidth=2.5, color='#0284c7', label='Monsoon Rainfall Jun-Sep (mm)')
    plt.title("Decadal Mean Rainfall Trends in India (1900s to 2010s)", fontsize=13, weight='bold', pad=12)
    plt.ylabel("Precipitation (mm)", fontsize=11)
    plt.xlabel("Decade", fontsize=11)
    plt.xticks(rotation=45)
    plt.legend(frameon=True)
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, '02_decadal_trends.png'), dpi=fig_dpi)
    plt.close()

    # Fig 3: Correlation Matrix Heatmap
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr_matrix, cmap='YlGnBu', annot=True, fmt='.2f', cbar=True, annot_kws={"size": 7})
    plt.title("Correlation Matrix: Monthly & Seasonal Meteorological Aggregates", fontsize=12, weight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, '03_correlation_heatmap.png'), dpi=fig_dpi)
    plt.close()

    # Fig 4: Wettest vs Driest Subdivisions
    sorted_subs = sorted(sub_data.values(), key=lambda x: x['mean_annual'], reverse=True)
    top_5 = sorted_subs[:5]
    bottom_5 = sorted_subs[-5:]
    comp_subs = top_5 + bottom_5

    plt.figure(figsize=(12, 6))
    names = [s['subdivision'] for s in comp_subs]
    vals = [s['mean_annual'] for s in comp_subs]
    colors = ['#10b981']*5 + ['#f59e0b']*5

    bars = plt.barh(names[::-1], vals[::-1], color=colors[::-1])
    plt.xlabel("Annual Mean Rainfall (mm)", fontsize=11)
    plt.title("Top 5 Wettest (Green) vs Top 5 Driest (Orange) Subdivisions in India", fontsize=13, weight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, '04_subdivision_contrast.png'), dpi=fig_dpi)
    plt.close()

    print("EDA completed successfully! Visualizations and JSON summaries exported.")

if __name__ == '__main__':
    main()
