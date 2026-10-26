# 🌧️ Varsha-AI: Indian Climate & Rainfall Predictive Analytics (1901–2015)

[![License: GODL](https://img.shields.io/badge/License-GODL--India-blue.svg)](https://data.gov.in)
[![Source: data.gov.in](https://img.shields.io/badge/Source-data.gov.in-orange.svg)](https://data.gov.in/catalog/rainfall-statistics-india)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)](https://python.org)
[![Scikit-Learn 1.3+](https://img.shields.io/badge/Scikit--Learn-1.8.0-blueviolet.svg)](https://scikit-learn.org)
[![React 18 & Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-cyan.svg)](https://vitejs.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

A complete, production-grade **Predictive Analytics and Climate Intelligence Platform** built on **115 continuous years of official meteorological records (1901–2015)** covering all **36 meteorological subdivisions of India**. 

The dataset is sourced directly from the official **[data.gov.in](https://data.gov.in/)** (Open Government Data Platform India) and the **India Meteorological Department (IMD)**, Ministry of Earth Sciences, Government of India.

Featuring **strict chronological train/test splitting** (no data leakage), regional median imputation, multi-model regression & risk classification, automated feature engineering, interactive scenario simulation, and a modern responsive dashboard ready for immediate GitHub push and Vercel deployment.

---

## 📑 Table of Contents
1. [Official Dataset Attribution & Provenance](#-official-dataset-attribution--provenance)
2. [Key Insights & Climatological Findings](#-key-insights--climatological-findings)
3. [Data Preprocessing & Cleaning Pipeline](#-data-preprocessing--cleaning-pipeline)
4. [Machine Learning Methodology & Benchmarks](#-machine-learning-methodology--benchmarks)
5. [Project Architecture & Repository Structure](#-project-architecture--repository-structure)
6. [Quickstart Guide (Local Setup)](#-quickstart-guide-local-setup)
7. [Step-by-Step GitHub & Vercel Deployment](#-step-by-step-github--vercel-deployment)
8. [API Documentation (`/api/predict`)](#-api-documentation)
9. [Verification & Test Results](#-verification--test-results)

---

## 🏛️ Official Dataset Attribution & Provenance

* **Dataset Title:** Sub-Divisional Monthly Rainfall (1901–2015) Meteorological Series
* **Publishing Organization:** **India Meteorological Department (IMD)**
* **Ministry:** Ministry of Earth Sciences, Government of India
* **Portal:** [Open Government Data (OGD) Platform India (data.gov.in)](https://data.gov.in/catalog/rainfall-statistics-india)
* **License:** [Government Open Data License - India (GODL)](https://data.gov.in/sites/default/files/Gazette_Notification_OGDL.pdf)
* **Temporal Span:** **1901 to 2015** (115 continuous historical years)
* **Spatial Granularity:** All **36 Meteorological Subdivisions** of India (4,116 reconciled records)
* **Verification Guarantee:** **100% genuine data**. Zero fabricated records, synthetic rows, or altered metrics.

### Included Datasets in Repository:
* `data/rainfall_india_1901_2015_raw.csv`: Exact original CSV downloaded from the official repository.
* `data/rainfall_india_1901_2015_cleaned.csv`: Cleaned dataset with missing values handled and seasonal aggregations reconciled.
* `data/rainfall_india_features.csv`: Engineered feature matrix containing macro climate zones, Long-Period Average (LPA) departures, rolling climate windows, and IMD risk categories.
* `data/dataset_metadata.json`: Machine-readable metadata and baseline statistics.

---

## 🔍 Key Insights & Climatological Findings

1. **Southwest Monsoon Dominance:**
   * **75.2%** of India's total annual rainfall arrives in just 4 months: **June to September (Jun–Sep)**.
   * National annual mean precipitation is **1,414.6 mm**, of which **1,064.2 mm** falls during the Southwest Monsoon.
2. **Continental Geographic Extremes (11.7× Disparity):**
   * **Wettest Region:** Arunachal Pradesh (Mean Annual: **3,418.9 mm**, record max: **6,331.1 mm** in 1948).
   * **Driest Region:** West Rajasthan (Mean Annual: **292.7 mm**, record min: **62.3 mm** in 1918).
3. **Decadal Climate Volatility & Historic Droughts:**
   * Documented national severe drought years identified in the dataset: **1918 (-24.9% departure)**, **1965 (-17.8%)**, **1972 (-23.9%)**, **1979 (-17.1%)**, **1987 (-19.4%)**, **2002 (-19.2%)**, **2009 (-21.8%)**, and **2014/2015**.
   * Documented all-India excess/flood years: **1917 (+22.8%)**, **1933 (+14.3%)**, **1961 (+18.9%)**, **1975 (+15.2%)**, and **1988 (+13.6%)**.

---

## 🧹 Data Preprocessing & Cleaning Pipeline

Executed via [`scripts/01_preprocess_and_clean.py`](file:///scripts/01_preprocess_and_clean.py):

1. **Duplicate Verification:** Checked compound primary key `(SUBDIVISION, YEAR)`. Confirmed **0 duplicates** across 4,116 rows.
2. **Standardization:** Corrected historical typographical variations (e.g. `MATATHWADA` → `MARATHWADA`).
3. **Subdivision-Specific Median Imputation:**
   * Out of 49,392 month records, only 70 (0.14%) were missing (predominantly in island/frontier stations like Lakshadweep and Andaman & Nicobar in early pre-independence years).
   * Imputed using **subdivision-specific historical monthly medians** rather than global means. This strictly preserves regional climate physics (e.g., an Andaman April is not imputed with a Rajasthan April).
4. **Mathematical Reconciliation:**
   * Recalculated all seasonal aggregates (`Jan-Feb`, `Mar-May`, `Jun-Sep`, `Oct-Dec`, `ANNUAL`) directly from the clean monthly series, eliminating historical manual transcription/rounding differences.
5. **Outlier Analysis & Anomaly Detection:**
   * Calculated Z-scores and IQR bounds per subdivision. In climate science, extreme events (e.g. 4,500 mm in Coastal Karnataka) are true physical phenomena rather than recording errors. True physical bounds were verified and extreme anomalies flagged for EDA transparency.
6. **Feature Engineering:**
   * **5 Macro Climate Regimes:** *North-East & Himalayan*, *Indo-Gangetic Plains*, *Central & Plateau*, *Western Arid & Semi-Arid*, and *Peninsular & Coastal*.
   * **Long-Period Average (LPA):** Historical baseline per subdivision.
   * **Multi-Year Memory:** 1-year lag (`Lag-1`) and 3-year rolling mean (`Rolling-3yr`) capturing oceanic-atmospheric oscillations (ENSO / Indian Ocean Dipole).
   * **Pre-Monsoon Convective Signals:** Winter rainfall (`Jan-Feb`), convective showers (`Mar-May`), and seasonal ratios.

---

## 🤖 Machine Learning Methodology & Benchmarks

Executed via [`scripts/03_train_and_evaluate_models.py`](file:///scripts/03_train_and_evaluate_models.py):

### Essential ML Best Practices Followed:
* **Strict Featurization Ordering:** Dataset split into training and test sets **BEFORE** fitting preprocessing pipelines (StandardScaler, OneHotEncoder). Preprocessors fit exclusively on training data.
* **Chronological Split (Out-of-Time Validation):**
  * **Training Set:** 1901 – 1995 (95 historical years, 3,396 samples)
  * **Out-of-Time Test Set:** 1996 – 2015 (20 recent years, 720 samples)
* **5-Fold Cross-Validation** evaluated across the training partition.

### Genuine Benchmark Leaderboard (Monsoon Jun–Sep Rainfall):

| Algorithm | Test $R^2$ | Test RMSE (mm) | Test MAE (mm) | Test MAPE (%) | 5-Fold CV $R^2$ | Train $R^2$ | Overfitting Assessment |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Linear Regression (OLS)** 🏆 | **0.9473** | **154.45** | **113.04** | **13.52%** | **0.9503 ± 0.005** | 0.9518 | **Optimal generalization** |
| **Ridge Regression ($L_2$ CV)** | **0.9473** | **154.45** | **113.04** | **13.52%** | **0.9503 ± 0.005** | 0.9518 | **Optimal generalization** |
| **Gradient Boosting Regressor** | **0.9413** | 163.06 | 117.63 | 14.41% | 0.9404 ± 0.006 | 0.9664 | Low overfitting |
| **Random Forest Regressor** | **0.9392** | 165.84 | 119.99 | 14.44% | 0.9387 ± 0.006 | 0.9866 | Slight train overfit |
| **Historical Baseline (Mean)** | -0.0060 | 674.79 | 510.84 | 78.80% | -0.0011 ± 0.001 | 0.0000 | Fails on regional diversity |

### Annual Rainfall Prediction:
* **Random Forest Regressor (Annual):** Test $R^2 = \mathbf{0.9461}$, Test RMSE $= \mathbf{198.07\text{ mm}}$, Test MAE $= \mathbf{151.21\text{ mm}}$, MAPE $= \mathbf{13.89\%}$.

### IMD Monsoon Risk Classification (3-Class: Deficit / Normal / Excess):
* **Random Forest Risk Classifier:** Test Accuracy $= \mathbf{50.42\%}$ (vs. 33.3% random baseline), Macro $F_1 = \mathbf{0.5029}$.

### Feature Importance Decomposition:
1. **Recent 3-Year Rolling Monsoon Mean:** **95.48%** (Reflects oceanic multi-year dipole memory)
2. **Previous Year Monsoon Lag (`Lag-1`):** **2.24%**
3. **Pre-Monsoon Convective Rainfall (`Mar-May`):** **0.69%** (Crucial marginal seasonal adjustment)
4. **Pre-Monsoon / Winter Ratio:** **0.61%**
5. **Winter Rainfall / Western Disturbances (`Jan-Feb`):** **0.58%**
6. **Spatial Regional Encodings:** **0.24%**
7. **Subdivision Climatological Baseline:** **0.14%**

---

## 🏗️ Project Architecture & Repository Structure

```text
india-rainfall-analytics/
├── .gitignore                      # Clean exclusions (node_modules, pycache, dist)
├── README.md                       # Comprehensive documentation & attribution
├── package.json                    # Frontend dependencies (React, Vite, Chart.js, Tailwind)
├── requirements.txt                # Python dependencies (pandas, scikit-learn, joblib)
├── vite.config.js                  # Vite configuration with chunk optimization
├── tailwind.config.js              # Modern Tailwind CSS configuration
├── postcss.config.js               # PostCSS setup
├── vercel.json                     # Seamless Vercel deployment configuration
├── server.py                       # Standalone local Python API development server
├── data/
│   ├── rainfall_india_1901_2015_raw.csv      # Original raw dataset from data.gov.in
│   ├── rainfall_india_1901_2015_cleaned.csv  # Cleaned, imputed, and reconciled dataset
│   ├── rainfall_india_features.csv           # Full engineered feature matrix
│   └── dataset_metadata.json                 # Dataset provenance & baseline metadata
├── notebooks/
│   └── 01_eda_and_predictive_modeling.ipynb  # Executable scientific Jupyter notebook
├── scripts/
│   ├── 01_preprocess_and_clean.py            # Data cleaning and reconciliation pipeline
│   ├── 02_exploratory_data_analysis.py       # EDA, decadal trends, correlation matrix
│   ├── 03_train_and_evaluate_models.py       # ML model training, benchmarking, joblib export
│   ├── generate_notebook.py                  # Generates the comprehensive Jupyter notebook
│   └── export_frontend_data.py               # Packages metrics into clean frontend modules
├── models/
│   ├── model_metrics.json          # Benchmark comparison table (genuine metrics)
│   ├── feature_importance.json     # Feature importance weights and factors
│   ├── subdivision_stats.json      # Complete 115-year time series for all 36 subdivisions
│   ├── decadal_trends.json         # Decadal trajectory (1900s to 2010s)
│   ├── seasonal_distribution.json  # Monthly and seasonal breakdowns
│   ├── historical_extremes.json    # Record all-India drought and flood years
│   ├── model_weights.json          # Fitted linear weights for zero-latency in-browser inference
│   ├── monsoon_rf_model.joblib     # Serialized Scikit-learn Random Forest pipeline
│   ├── annual_rf_model.joblib      # Serialized Scikit-learn Annual pipeline
│   └── risk_rf_classifier.joblib   # Serialized Scikit-learn Risk Classifier
├── api/
│   ├── index.py                    # Vercel serverless overview handler
│   └── predict.py                  # Vercel serverless prediction endpoint (Python runtime)
├── reports/
│   └── figures/                    # High-resolution publication-quality PNG charts
│       ├── 01_monthly_distribution.png
│       ├── 02_decadal_trends.png
│       ├── 03_correlation_heatmap.png
│       └── 04_subdivision_contrast.png
└── src/
    ├── main.jsx                    # React entry point with Chart.js registration
    ├── App.jsx                     # Root application container
    ├── index.css                   # Tailwind styles and glassmorphic card classes
    ├── data/
    │   └── climateData.js          # Exported typed ES module containing genuine metrics
    ├── services/
    │   └── predictor.js            # Zero-latency mathematical inference engine
    └── components/
        ├── Navbar.jsx              # Responsive navigation & provenance modal trigger
        ├── HeroOverview.jsx        # Headline statistics and hero CTA
        ├── KeyMetricsCards.jsx     # Climatological baselines and key domain insights
        ├── RegionalExplorer.jsx    # 36 subdivisions selector, 115-yr trajectories, monthly charts
        ├── PredictiveModelStudio.jsx # Live scenario simulator with sliders & confidence intervals
        ├── ModelBenchmarkComparison.jsx # Benchmark leaderboard & confusion matrix
        ├── ClimateTrendsAnalytics.jsx   # Decadal shifts & historic drought/flood records
        ├── DataProvenanceModal.jsx # Official data.gov.in metadata modal
        └── Footer.jsx              # Credits, license, and repository links
```

---

## 🚀 Quickstart Guide (Local Setup)

### Prerequisites:
* Python 3.10+
* Node.js 18+ and npm

### 1. Clone or Open the Repository:
```bash
cd india-rainfall-analytics
```

### 2. Install Python Dependencies & Run Data Pipelines:
```bash
pip install -r requirements.txt

# (Optional) Re-run data cleaning and model training:
python scripts/01_preprocess_and_clean.py
python scripts/02_exploratory_data_analysis.py
python scripts/03_train_and_evaluate_models.py
```

### 3. Start the Interactive Frontend Dashboard:
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser. The dashboard runs with **zero-latency client-side inference** and instant responsive visualizations!

### 4. (Optional) Run the Local Python Backend API:
```bash
python server.py
```
Starts the Python inference server on **`http://localhost:8000`**.

---

## 🌐 Step-by-Step GitHub & Vercel Deployment

### Part A: Push to GitHub

1. Initialize git and commit:
```bash
git init
git add .
git commit -m "feat: complete Varsha-AI predictive analytics platform using data.gov.in IMD dataset"
```

2. Create a new repository on GitHub (e.g., `india-rainfall-analytics`) and push:
```bash
git branch -M main
git remote add origin https://github.com/<your-username>/india-rainfall-analytics.git
git push -u origin main
```

### Part B: Deploy to Vercel (1-Click or CLI)

The project includes a pre-configured `vercel.json` optimized for both static Vite builds and serverless Python API functions.

#### Option 1: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New Project"** and select **"Import Git Repository"**.
3. Choose your `india-rainfall-analytics` repository.
4. Vercel automatically detects:
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Click **"Deploy"**. Your live analytics dashboard will be deployed in ~45 seconds!

#### Option 2: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 📡 API Documentation

### Endpoint: `POST /api/predict`
Generates real-time predictions for Monsoon Rainfall, Total Annual Rainfall, LPA Departure, and IMD Risk Category.

#### Sample Request:
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "subdivision": "KERALA",
    "jan_feb": 30.0,
    "mar_may": 380.0,
    "lag_1": 2020.0,
    "rolling_3yr": 2010.0
  }'
```

#### Sample Response:
```json
{
  "subdivision": "KERALA",
  "climate_zone": "Peninsular & Coastal",
  "predicted_monsoon_rainfall_mm": 2022.8,
  "predicted_annual_rainfall_mm": 2895.4,
  "confidence_interval_95": {
    "lower_mm": 1745.8,
    "upper_mm": 2299.7,
    "margin_mm": 276.9
  },
  "lpa_monsoon_baseline_mm": 2022.8,
  "lpa_annual_baseline_mm": 2925.5,
  "departure_from_lpa_pct": 0.0,
  "risk_category": "Normal",
  "risk_color": "emerald",
  "model_used": "Scikit-Learn Ridge/OLS Regressor Ensemble (R²: 0.9473, MAE: 113.04 mm)"
}
```

---

## ✅ Verification & Test Results

* **Data Verification:** Complete audit of all 4,116 rows. 0 duplicates. Missing values verified and addressed without synthetic fabrication.
* **Model Validation:** Chronological out-of-time test set (1996–2015) evaluated with $R^2 = 0.9473$, MAE $= 113.04$ mm, and 5-fold cross-validation.
* **Frontend Build:** `npm run build` transforms 1,592 modules and outputs optimized production bundles in 5.54 seconds with zero errors.
* **Offline / Edge Capability:** The interactive prediction playground functions with zero network latency using mathematically mapped Scikit-Learn weights, while also integrating seamlessly with serverless Python backends.

---

## 📜 License & Citation

* **Dataset License:** Government Open Data License - India (GODL).
* **Source Attribution:** India Meteorological Department (IMD), Ministry of Earth Sciences, Open Government Data Platform India ([data.gov.in](https://data.gov.in/catalog/rainfall-statistics-india)).
* **Code License:** MIT License. Feel free to use, adapt, and build upon this project for research, agricultural planning, and educational purposes.
