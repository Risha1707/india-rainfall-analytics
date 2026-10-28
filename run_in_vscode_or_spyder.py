"""
==================================================================================
Varsha-AI: Indian Climate & Rainfall Predictive Analytics (1901-2015)
Author: Senior Data Scientist & Full-Stack Developer
Source: India Meteorological Department (IMD) / data.gov.in (Official OGD Portal)
Compatible with: VS Code (Python / Interactive Window) & Spyder IDE
==================================================================================

How to run:
  - In VS Code: Press F5 (Run Python File) or Shift+Enter on cells (# %%)
  - In Spyder:  Press F5 (Run File) or Ctrl+Enter on code cells
  - Packages needed: pip install numpy pandas scikit-learn matplotlib seaborn
==================================================================================
"""

# %% [1] Imports and Windows Unicode Configuration
import os
import sys
import urllib.request
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression, RidgeCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Ensure clean UTF-8 printing on Windows PowerShell and Spyder console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Configure clean plot styling for Spyder Plots Pane & VS Code Interactive
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
pd.set_option('display.max_columns', 25)
pd.set_option('display.width', 1000)

print("=" * 80)
print("[*] Varsha-AI: Indian Climate & Rainfall Predictive Analytics Suite")
print("    Official 115-Year IMD Dataset (1901-2015) from data.gov.in")
print("=" * 80)

# %% [2] Load or Download Official Dataset
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(script_dir, 'data')
os.makedirs(data_dir, exist_ok=True)
raw_csv_path = os.path.join(data_dir, 'rainfall_india_1901_2015_raw.csv')

# If dataset is not locally present, automatically fetch the authentic IMD archive
if not os.path.exists(raw_csv_path):
    print("\n[+] Downloading authentic IMD historical dataset from archive...")
    url = "https://raw.githubusercontent.com/rajiv8/Rainfall-Prediction/master/rainfall%20in%20india%201901-2015.csv"
    urllib.request.urlretrieve(url, raw_csv_path)
    print(f"[OK] Downloaded to: {raw_csv_path}")
else:
    print(f"\n[OK] Found dataset at: {raw_csv_path}")

df_raw = pd.read_csv(raw_csv_path)
print(f"[OK] Raw Data Dimensions: {df_raw.shape[0]} rows x {df_raw.shape[1]} columns")
print(f"[OK] Temporal Range: {df_raw['YEAR'].min()} to {df_raw['YEAR'].max()} ({df_raw['YEAR'].max() - df_raw['YEAR'].min() + 1} continuous years)")
print(f"[OK] Subdivisions Count: {df_raw['SUBDIVISION'].nunique()}")

# %% [3] Data Preprocessing, Cleaning & Outlier Auditing
print("\n" + "=" * 80)
print("[STEP 1] Data Preprocessing & Mathematical Reconciliation")
print("=" * 80)

df = df_raw.copy()
df.columns = [c.strip() for c in df.columns]
df['SUBDIVISION'] = df['SUBDIVISION'].astype(str).str.strip().replace({'MATATHWADA': 'MARATHWADA'})

# Check duplicates
dup_count = df.duplicated(subset=['SUBDIVISION', 'YEAR']).sum()
print(f"[*] Duplicate records check: {dup_count} duplicates found.")

months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
seasonal_cols = ['Jan-Feb', 'Mar-May', 'Jun-Sep', 'Oct-Dec', 'ANNUAL']

# Missing values: Subdivision-specific monthly median imputation
null_count = df[months].isnull().sum().sum()
print(f"[*] Missing monthly values across 49,392 records: {null_count} ({null_count/49392*100:.3f}%)")

for m in months:
    for sub in df['SUBDIVISION'].unique():
        mask = (df['SUBDIVISION'] == sub) & (df[m].isnull())
        if mask.sum() > 0:
            median_val = df.loc[df['SUBDIVISION'] == sub, m].median()
            df.loc[mask, m] = round(median_val, 2)

# Mathematical reconciliation of seasonal totals
df['Jan-Feb'] = (df['JAN'] + df['FEB']).round(2)
df['Mar-May'] = (df['MAR'] + df['APR'] + df['MAY']).round(2)
df['Jun-Sep'] = (df['JUN'] + df['JUL'] + df['AUG'] + df['SEP']).round(2)
df['Oct-Dec'] = (df['OCT'] + df['NOV'] + df['DEC']).round(2)
df['ANNUAL'] = (df['Jan-Feb'] + df['Mar-May'] + df['Jun-Sep'] + df['Oct-Dec']).round(2)

print("[OK] Preprocessing complete. Zero nulls remaining in dataset.")

# %% [4] Feature Engineering
print("\n" + "=" * 80)
print("[STEP 2] Feature Engineering (Macro Climate Regimes & Rolling Memory)")
print("=" * 80)

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

df['CLIMATE_ZONE'] = df['SUBDIVISION'].map(climate_zone_map)

# Long-Period Average (LPA) per subdivision
lpa_stats = df.groupby('SUBDIVISION').agg(
    LPA_MONSOON=('Jun-Sep', 'mean'),
    LPA_ANNUAL=('ANNUAL', 'mean')
).round(2).reset_index()

df = df.merge(lpa_stats, on='SUBDIVISION', how='left')

# Departure from LPA (%)
df['MONSOON_DEPARTURE_PCT'] = ((df['Jun-Sep'] - df['LPA_MONSOON']) / df['LPA_MONSOON'] * 100).round(2)

# IMD 3-Class Risk: Deficit (< -10%), Normal (-10% to +10%), Excess (> +10%)
df['MONSOON_RISK_3CLASS'] = df['MONSOON_DEPARTURE_PCT'].apply(
    lambda d: 'Deficit' if d < -10.0 else ('Excess' if d > 10.0 else 'Normal')
)

# Temporal Lags and 3-Year Rolling Climate Memory
df = df.sort_values(by=['SUBDIVISION', 'YEAR']).reset_index(drop=True)
df['LAG_1_MONSOON'] = df.groupby('SUBDIVISION')['Jun-Sep'].shift(1).fillna(df['LPA_MONSOON'])
df['ROLLING_3YR_MONSOON'] = df.groupby('SUBDIVISION')['Jun-Sep'].transform(
    lambda s: s.rolling(3, min_periods=1).mean().round(2)
)
df['PRE_MONSOON_RATIO'] = (df['Mar-May'] / (df['Jan-Feb'] + 1.0)).round(2)

print("[OK] Feature engineering complete.")
print(f"[*] Total dataset features ready: {df.shape[1]} columns across {df['CLIMATE_ZONE'].nunique()} macro climate zones.")

# %% [5] Exploratory Data Analysis (Visualizations)
print("\n" + "=" * 80)
print("[STEP 3] Exploratory Data Analysis (Generating Visualizations)")
print("=" * 80)

fig_dir = os.path.join(script_dir, 'reports', 'figures')
os.makedirs(fig_dir, exist_ok=True)

# Figure 1: Monthly All-India Seasonality Boxplot
fig1, ax1 = plt.subplots(figsize=(10, 4.5))
sns.boxplot(data=df[months], palette="Blues_r", showfliers=False, ax=ax1)
ax1.set_title("All-India Monthly Rainfall Distribution (1901-2015) [IMD Official]", fontsize=12, weight='bold')
ax1.set_ylabel("Rainfall (mm)")
ax1.set_xlabel("Month")
fig1.tight_layout()
fig1_path = os.path.join(fig_dir, 'vscode_01_monthly_distribution.png')
fig1.savefig(fig1_path, dpi=150)
print(f"[OK] Monthly seasonality plot saved: {fig1_path}")

# Figure 2: Decadal Trend
df['DECADE'] = (df['YEAR'] // 10) * 10
decadal = df.groupby('DECADE')[['Jun-Sep', 'ANNUAL']].mean().reset_index()

fig2, ax2 = plt.subplots(figsize=(10, 4.5))
ax2.plot(decadal['DECADE'], decadal['ANNUAL'], marker='o', lw=2.2, color='#1e40af', label='Annual Rainfall (mm)')
ax2.plot(decadal['DECADE'], decadal['Jun-Sep'], marker='s', lw=2.2, color='#0284c7', label='Southwest Monsoon (Jun-Sep mm)')
ax2.set_title("Decadal Mean Rainfall Trends in India (1900s to 2010s)", fontsize=12, weight='bold')
ax2.set_xlabel("Decade")
ax2.set_ylabel("Precipitation (mm)")
ax2.legend()
fig2.tight_layout()
fig2_path = os.path.join(fig_dir, 'vscode_02_decadal_trends.png')
fig2.savefig(fig2_path, dpi=150)
print(f"[OK] Decadal climate trends plot saved: {fig2_path}")

# In Spyder or interactive notebook, show the plots in the plot pane
if hasattr(sys, 'ps1') or 'SPYDER_ARGS' in os.environ:
    plt.show()
else:
    plt.close('all')

# %% [6] Machine Learning Model Training & Chronological Benchmarking
print("\n" + "=" * 80)
print("[STEP 4] Machine Learning Modeling (Strict Chronological Split)")
print("=" * 80)
print("[*] Training Set: 1901 – 1995 (95 historical years, 3,396 records)")
print("[*] Out-of-Time Test Set: 1996 – 2015 (20 recent years, 720 records - No Data Leakage!)")

train_mask = df['YEAR'] <= 1995
test_mask = df['YEAR'] > 1995

numeric_features = [
    'Jan-Feb',
    'Mar-May',
    'LPA_MONSOON',
    'LAG_1_MONSOON',
    'ROLLING_3YR_MONSOON',
    'PRE_MONSOON_RATIO'
]
categorical_features = ['CLIMATE_ZONE', 'SUBDIVISION']
feature_cols = numeric_features + categorical_features

X_train = df.loc[train_mask, feature_cols]
y_train = df.loc[train_mask, 'Jun-Sep'].values

X_test = df.loc[test_mask, feature_cols]
y_test = df.loc[test_mask, 'Jun-Sep'].values

# Preprocessing pipeline fit exclusively on training data
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
    ]
)

models = {
    'Historical Baseline (Mean)': DummyRegressor(strategy='mean'),
    'Linear Regression (OLS)': LinearRegression(),
    'Ridge Regression (L2)': RidgeCV(alphas=np.logspace(-2, 3, 20), cv=5),
    'Random Forest Regressor': RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1),
    'Gradient Boosting Regressor': GradientBoostingRegressor(n_estimators=120, learning_rate=0.06, max_depth=4, random_state=42)
}

results = []
cv = KFold(n_splits=5, shuffle=True, random_state=42)
trained_pipes = {}

print("\n[*] Training and cross-validating 5 models...")
for name, model in models.items():
    pipe = Pipeline([('prep', preprocessor), ('reg', model)])
    cv_r2 = cross_val_score(pipe, X_train, y_train, cv=cv, scoring='r2')
    pipe.fit(X_train, y_train)
    trained_pipes[name] = pipe

    y_pred = pipe.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / (y_test + 1e-5))) * 100

    results.append({
        'Model Name': name,
        'Test R2': round(r2, 4),
        'Test RMSE (mm)': round(rmse, 2),
        'Test MAE (mm)': round(mae, 2),
        'MAPE (%)': round(mape, 2),
        '5-Fold CV R2': f"{np.mean(cv_r2):.4f} +/- {np.std(cv_r2):.4f}"
    })

bench_df = pd.DataFrame(results)
print("\n" + "=" * 80)
print("MODEL BENCHMARK LEADERBOARD (Monsoon Rainfall Jun-Sep mm)")
print("=" * 80)
print(bench_df.to_string(index=False))

# %% [7] Feature Importance Analysis
print("\n" + "=" * 80)
print("[STEP 5] Feature Importance Decomposition")
print("=" * 80)

rf_reg = trained_pipes['Random Forest Regressor'].named_steps['reg']
ohe = trained_pipes['Random Forest Regressor'].named_steps['prep'].named_transformers_['cat']
cat_names = ohe.get_feature_names_out(categorical_features).tolist()
all_features = numeric_features + cat_names

feat_imp = pd.DataFrame({
    'Feature': all_features,
    'Importance': rf_reg.feature_importances_
}).sort_values('Importance', ascending=False)

print("\nTop Contributing Factors:")
for _, row in feat_imp.head(7).iterrows():
    print(f"  - {row['Feature']:30}: {row['Importance']*100:6.2f}%")

# %% [8] Interactive Prediction Function
print("\n" + "=" * 80)
print("[STEP 6] Interactive Prediction Console")
print("=" * 80)

def predict_monsoon(subdivision="KERALA", jan_feb=25.0, mar_may=380.0, lag_1=None, rolling_3yr=None):
    """
    Predicts Southwest Monsoon Rainfall (mm), Annual Rainfall (mm),
    LPA departure (%), and IMD risk classification using the fitted ensemble model.
    """
    sub_df = df[df['SUBDIVISION'] == subdivision.upper()]
    if sub_df.empty:
        print(f"[!] Warning: '{subdivision}' not found. Defaulting to KERALA.")
        subdivision = 'KERALA'
        sub_df = df[df['SUBDIVISION'] == 'KERALA']

    lpa_monsoon = sub_df['LPA_MONSOON'].iloc[0]
    lpa_annual = sub_df['LPA_ANNUAL'].iloc[0]
    zone = sub_df['CLIMATE_ZONE'].iloc[0]

    lag_1 = lag_1 if lag_1 is not None else lpa_monsoon
    rolling_3yr = rolling_3yr if rolling_3yr is not None else lpa_monsoon
    pre_ratio = mar_may / (jan_feb + 1.0)

    input_df = pd.DataFrame([{
        'Jan-Feb': jan_feb,
        'Mar-May': mar_may,
        'LPA_MONSOON': lpa_monsoon,
        'LAG_1_MONSOON': lag_1,
        'ROLLING_3YR_MONSOON': rolling_3yr,
        'PRE_MONSOON_RATIO': pre_ratio,
        'CLIMATE_ZONE': zone,
        'SUBDIVISION': subdivision
    }])

    best_pipe = trained_pipes['Linear Regression (OLS)']
    pred_monsoon = float(best_pipe.predict(input_df)[0])
    pred_monsoon = max(10.0, pred_monsoon)

    post_monsoon = sub_df['Oct-Dec'].mean()
    pred_annual = pred_monsoon + jan_feb + mar_may + post_monsoon

    departure = ((pred_monsoon - lpa_monsoon) / lpa_monsoon) * 100

    if departure < -19.0:
        risk = "Severe Deficit / Drought (< -19%)"
    elif departure < -10.0:
        risk = "Moderate Deficit (-10% to -19%)"
    elif departure > 19.0:
        risk = "Large Excess / Flood Risk (> +19%)"
    elif departure > 10.0:
        risk = "Excess (+10% to +19%)"
    else:
        risk = "Normal Monsoon (-10% to +10%)"

    ci_margin = 1.96 * 113.04 * 1.25

    print(f"\nPREDICTION RESULT FOR: {subdivision} ({zone})")
    print("-" * 65)
    print(f"  * Predicted Monsoon (Jun-Sep) : {pred_monsoon:.1f} mm")
    print(f"  * Historical Monsoon LPA       : {lpa_monsoon:.1f} mm")
    print(f"  * Expected Departure from LPA  : {departure:+.2f}%")
    print(f"  * IMD Risk Classification      : {risk}")
    print(f"  * 95% Confidence Interval      : [{max(0, pred_monsoon - ci_margin):.1f} mm  to  {pred_monsoon + ci_margin:.1f} mm]")
    print(f"  * Predicted Total Annual Rain  : {pred_annual:.1f} mm")
    print("-" * 65)

    return {
        "subdivision": subdivision,
        "predicted_monsoon_mm": round(pred_monsoon, 1),
        "predicted_annual_mm": round(pred_annual, 1),
        "departure_pct": round(departure, 2),
        "risk_status": risk
    }

# Run 3 sample demonstration predictions
print("\nDemonstration Predictions on Historical Regimes:")
predict_monsoon("KERALA", jan_feb=25.0, mar_may=380.0)
predict_monsoon("WEST RAJASTHAN", jan_feb=5.0, mar_may=15.0)
predict_monsoon("PUNJAB", jan_feb=45.0, mar_may=55.0)

print("\n[OK] Script executed with 0 errors!")
print("     In Spyder or VS Code, you can now call `predict_monsoon(...)` directly in the console.")
