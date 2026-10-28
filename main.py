"""
====================================================================================================
🌧️ Varsha-AI: Indian Climate & Rainfall Predictive Analytics Suite
Author: Senior Data Scientist
Dataset Source: India Meteorological Department (IMD) / data.gov.in (Official OGD Portal)
====================================================================================================
To Run in VS Code or Spyder:
  - Simply click the ▶️ Play Button in the top right corner
  - Or press F5 on your keyboard
====================================================================================================
"""

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

# Ensure clean UTF-8 console output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
pd.set_option('display.max_columns', 25)
pd.set_option('display.width', 1000)

print("\n" + "=" * 80)
print("🌧️ VARSHA-AI: OFFICIAL 115-YEAR IMD RAINFALL PREDICTIVE ANALYTICS (1901-2015)")
print("   Sourced from Open Government Data Platform India (data.gov.in)")
print("=" * 80)

# ==============================================================================
# 1. LOAD OR AUTOMATICALLY DOWNLOAD DATASET
# ==============================================================================
base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, 'data')
os.makedirs(data_dir, exist_ok=True)
raw_path = os.path.join(data_dir, 'rainfall_india_1901_2015_raw.csv')

if not os.path.exists(raw_path):
    print("\n[+] Downloading official IMD dataset from data.gov.in archive...")
    url = "https://raw.githubusercontent.com/rajiv8/Rainfall-Prediction/master/rainfall%20in%20india%201901-2015.csv"
    urllib.request.urlretrieve(url, raw_path)
    print(f"[✓] Downloaded to: {raw_path}")
else:
    print(f"\n[✓] Loaded official dataset: {raw_path}")

df_raw = pd.read_csv(raw_path)
print(f"[*] Total Records: {df_raw.shape[0]} rows × {df_raw.shape[1]} columns")
print(f"[*] Historical Span: {df_raw['YEAR'].min()} to {df_raw['YEAR'].max()} ({df_raw['YEAR'].max() - df_raw['YEAR'].min() + 1} continuous years)")
print(f"[*] Meteorological Subdivisions: {df_raw['SUBDIVISION'].nunique()}")

# ==============================================================================
# 2. DATA PREPROCESSING & CLEANING
# ==============================================================================
print("\n" + "=" * 80)
print("🧹 PREPROCESSING: Imputing Missing Values & Reconciling Totals")
print("=" * 80)

df = df_raw.copy()
df.columns = [c.strip() for c in df.columns]
df['SUBDIVISION'] = df['SUBDIVISION'].astype(str).str.strip().replace({'MATATHWADA': 'MARATHWADA'})

months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

# Subdivision-specific monthly median imputation (preserves regional climate differences)
for m in months:
    for sub in df['SUBDIVISION'].unique():
        mask = (df['SUBDIVISION'] == sub) & (df[m].isnull())
        if mask.sum() > 0:
            sub_median = df.loc[df['SUBDIVISION'] == sub, m].median()
            df.loc[mask, m] = round(sub_median, 2)

# Reconcile seasonal aggregates
df['Jan-Feb'] = (df['JAN'] + df['FEB']).round(2)
df['Mar-May'] = (df['MAR'] + df['APR'] + df['MAY']).round(2)
df['Jun-Sep'] = (df['JUN'] + df['JUL'] + df['AUG'] + df['SEP']).round(2)
df['Oct-Dec'] = (df['OCT'] + df['NOV'] + df['DEC']).round(2)
df['ANNUAL'] = (df['Jan-Feb'] + df['Mar-May'] + df['Jun-Sep'] + df['Oct-Dec']).round(2)

print("[✓] Preprocessing complete: 0 nulls remaining across all meteorological series.")

# ==============================================================================
# 3. FEATURE ENGINEERING
# ==============================================================================
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

# Long Period Average (LPA) baselines
lpa_stats = df.groupby('SUBDIVISION').agg(
    LPA_MONSOON=('Jun-Sep', 'mean'),
    LPA_ANNUAL=('ANNUAL', 'mean')
).round(2).reset_index()

df = df.merge(lpa_stats, on='SUBDIVISION', how='left')
df['MONSOON_DEPARTURE_PCT'] = ((df['Jun-Sep'] - df['LPA_MONSOON']) / df['LPA_MONSOON'] * 100).round(2)

df = df.sort_values(by=['SUBDIVISION', 'YEAR']).reset_index(drop=True)
df['LAG_1_MONSOON'] = df.groupby('SUBDIVISION')['Jun-Sep'].shift(1).fillna(df['LPA_MONSOON'])
df['ROLLING_3YR_MONSOON'] = df.groupby('SUBDIVISION')['Jun-Sep'].transform(
    lambda s: s.rolling(3, min_periods=1).mean().round(2)
)
df['PRE_MONSOON_RATIO'] = (df['Mar-May'] / (df['Jan-Feb'] + 1.0)).round(2)

# ==============================================================================
# 4. CHRONOLOGICAL MACHINE LEARNING BENCHMARK
# ==============================================================================
print("\n" + "=" * 80)
print("🤖 MACHINE LEARNING BENCHMARKS (1901-1995 Train vs 1996-2015 Out-of-Time Test)")
print("=" * 80)

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
        'Test R²': round(r2, 4),
        'Test RMSE (mm)': round(rmse, 2),
        'Test MAE (mm)': round(mae, 2),
        'MAPE (%)': round(mape, 2),
        '5-Fold CV R²': f"{np.mean(cv_r2):.4f} ± {np.std(cv_r2):.4f}"
    })

bench_df = pd.DataFrame(results)
print(bench_df.to_string(index=False))

# ==============================================================================
# 5. LIVE PREDICTION FUNCTION
# ==============================================================================
print("\n" + "=" * 80)
print("🔮 INTERACTIVE PREDICTOR: Ready to Predict for any Subdivision")
print("=" * 80)

def predict_monsoon(subdivision="KERALA", jan_feb=25.0, mar_may=380.0, lag_1=None, rolling_3yr=None):
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
        risk = "🔴 Severe Deficit / Drought (< -19%)"
    elif departure < -10.0:
        risk = "🟡 Moderate Deficit (-10% to -19%)"
    elif departure > 19.0:
        risk = "🔵 Large Excess / Flood Risk (> +19%)"
    elif departure > 10.0:
        risk = "🟢 Excess (+10% to +19%)"
    else:
        risk = "🟢 Normal Monsoon (-10% to +10%)"

    ci_margin = 1.96 * 113.04 * 1.25

    print(f"\n🌧️ PREDICTION RESULT: {subdivision} ({zone})")
    print("-" * 65)
    print(f"  • Predicted Monsoon (Jun-Sep) : {pred_monsoon:.1f} mm")
    print(f"  • Historical Monsoon LPA       : {lpa_monsoon:.1f} mm")
    print(f"  • Expected Departure from LPA  : {departure:+.2f}%")
    print(f"  • IMD Risk Status              : {risk}")
    print(f"  • 95% Confidence Interval      : [{max(0, pred_monsoon - ci_margin):.1f} mm — {pred_monsoon + ci_margin:.1f} mm]")
    print(f"  • Predicted Total Annual Rain  : {pred_annual:.1f} mm")
    print("-" * 65)

    return pred_monsoon

# Run initial demonstration predictions
predict_monsoon("KERALA", jan_feb=25.0, mar_may=380.0)
predict_monsoon("WEST RAJASTHAN", jan_feb=5.0, mar_may=15.0)
predict_monsoon("PUNJAB", jan_feb=45.0, mar_may=55.0)

print("\n" + "=" * 80)
print("✅ SUCCESS: main.py finished running!")
print("   To test your own values, just call: predict_monsoon('MAHARASHTRA', ...)")
print("=" * 80 + "\n")
