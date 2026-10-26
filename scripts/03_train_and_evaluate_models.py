"""
03_train_and_evaluate_models.py
Author: Senior Data Scientist
Description:
    Trains, validates, hypertunes, and benchmarks multiple machine learning models
    for Indian Monsoon Rainfall and Total Annual Rainfall prediction.
    Strictly follows ML best practices:
      - Chronological train/test split (1901-1995 train, 1996-2015 test)
      - Fit preprocessing ONLY on training data
      - 5-fold cross-validation on training partition
      - Compares Naive Baseline, Linear Regression, Ridge, Random Forest, and Gradient Boosting
      - Evaluates Risk Classification (Deficit vs Normal vs Excess)
      - Exports genuine benchmark metrics, feature importance, and model weights
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression, RidgeCV, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, f1_score, confusion_matrix

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer, int)):
            return int(obj)
        if isinstance(obj, (np.floating, float)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

def mape_score(y_true, y_pred):
    return float(np.mean(np.abs((y_true - y_pred) / (y_true + 1e-5))) * 100)

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    features_path = os.path.join(base_dir, 'data', 'rainfall_india_features.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading feature dataset from {features_path}...")
    df = pd.read_csv(features_path)

    # 1. Chronological Split (No temporal data leakage!)
    # Train: 1901 to 1995 (95 years)
    # Test:  1996 to 2015 (20 years)
    train_mask = df['YEAR'] <= 1995
    test_mask = df['YEAR'] > 1995

    train_df = df[train_mask].copy()
    test_df = df[test_mask].copy()

    print(f"Training set: {train_df.shape[0]} records ({train_df['YEAR'].min()}-{train_df['YEAR'].max()})")
    print(f"Test set:     {test_df.shape[0]} records ({test_df['YEAR'].min()}-{test_df['YEAR'].max()})")

    # Define Feature Sets
    numeric_features = [
        'Jan-Feb',
        'Mar-May',
        'SUBDIVISION_LPA_MONSOON',
        'LAG_1_MONSOON',
        'ROLLING_3YR_MONSOON',
        'PRE_MONSOON_RATIO'
    ]
    categorical_features = ['CLIMATE_ZONE', 'SUBDIVISION']

    feature_cols = numeric_features + categorical_features

    X_train = train_df[feature_cols]
    y_train_monsoon = train_df['Jun-Sep'].values
    y_train_annual = train_df['ANNUAL'].values
    y_train_class = train_df['MONSOON_RISK_3CLASS'].values

    X_test = test_df[feature_cols]
    y_test_monsoon = test_df['Jun-Sep'].values
    y_test_annual = test_df['ANNUAL'].values
    y_test_class = test_df['MONSOON_RISK_3CLASS'].values

    # Preprocessing Pipeline (Fit ONLY on training data!)
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )

    cv = KFold(n_splits=5, shuffle=True, random_state=42)

    # ==========================================
    # 2. Benchmarking Regression Models (Monsoon Jun-Sep)
    # ==========================================
    candidate_regressors = {
        'Historical Baseline (Mean)': DummyRegressor(strategy='mean'),
        'Linear Regression (OLS)': LinearRegression(),
        'Ridge Regression (L2)': RidgeCV(alphas=np.logspace(-2, 3, 20), cv=5),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=100, max_depth=12, min_samples_split=4, random_state=42, n_jobs=-1),
        'Gradient Boosting Regressor': GradientBoostingRegressor(n_estimators=120, learning_rate=0.06, max_depth=4, random_state=42)
    }

    regression_benchmarks = []
    trained_pipelines = {}

    for name, model in candidate_regressors.items():
        print(f"Training and evaluating: {name}...")
        pipeline = Pipeline(steps=[('prep', preprocessor), ('reg', model)])

        # 5-fold cross validation on train
        cv_r2_scores = cross_val_score(pipeline, X_train, y_train_monsoon, cv=cv, scoring='r2')
        cv_mae_scores = -cross_val_score(pipeline, X_train, y_train_monsoon, cv=cv, scoring='neg_mean_absolute_error')

        # Fit on entire training set
        pipeline.fit(X_train, y_train_monsoon)
        trained_pipelines[name] = pipeline

        # Evaluate on Test Set (1996-2015)
        y_pred_test = pipeline.predict(X_test)
        test_r2 = float(r2_score(y_test_monsoon, y_pred_test))
        test_rmse = float(np.sqrt(mean_squared_error(y_test_monsoon, y_pred_test)))
        test_mae = float(mean_absolute_error(y_test_monsoon, y_pred_test))
        test_mape = mape_score(y_test_monsoon, y_pred_test)

        # Train metrics for overfitting check
        y_pred_train = pipeline.predict(X_train)
        train_r2 = float(r2_score(y_train_monsoon, y_pred_train))
        train_rmse = float(np.sqrt(mean_squared_error(y_train_monsoon, y_pred_train)))

        regression_benchmarks.append({
            "model_name": name,
            "target": "Monsoon (Jun-Sep mm)",
            "test_r2": round(test_r2, 4),
            "test_rmse_mm": round(test_rmse, 2),
            "test_mae_mm": round(test_mae, 2),
            "test_mape_pct": round(test_mape, 2),
            "cv_r2_mean": round(float(np.mean(cv_r2_scores)), 4),
            "cv_r2_std": round(float(np.std(cv_r2_scores)), 4),
            "cv_mae_mean_mm": round(float(np.mean(cv_mae_scores)), 2),
            "train_r2": round(train_r2, 4),
            "train_rmse_mm": round(train_rmse, 2),
            "is_best": False
        })

    # Mark the best model
    best_idx = max(range(len(regression_benchmarks)), key=lambda i: regression_benchmarks[i]['test_r2'])
    regression_benchmarks[best_idx]['is_best'] = True

    # ==========================================
    # 3. Train Annual Rainfall Regressor
    # ==========================================
    print("Training best model for Total Annual Rainfall...")
    annual_pipeline = Pipeline(steps=[
        ('prep', preprocessor),
        ('reg', RandomForestRegressor(n_estimators=100, max_depth=12, min_samples_split=4, random_state=42, n_jobs=-1))
    ])
    annual_pipeline.fit(X_train, y_train_annual)
    y_pred_annual = annual_pipeline.predict(X_test)

    annual_benchmark = {
        "model_name": "Random Forest (Annual)",
        "target": "Total Annual (mm)",
        "test_r2": round(float(r2_score(y_test_annual, y_pred_annual)), 4),
        "test_rmse_mm": round(float(np.sqrt(mean_squared_error(y_test_annual, y_pred_annual))), 2),
        "test_mae_mm": round(float(mean_absolute_error(y_test_annual, y_pred_annual)), 2),
        "test_mape_pct": round(mape_score(y_test_annual, y_pred_annual), 2)
    }

    # ==========================================
    # 4. Classification: Monsoon Risk (Deficit / Normal / Excess)
    # ==========================================
    print("Training Monsoon Risk Classification Models...")
    clf_pipeline = Pipeline(steps=[
        ('prep', preprocessor),
        ('clf', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced'))
    ])
    clf_pipeline.fit(X_train, y_train_class)
    y_pred_class = clf_pipeline.predict(X_test)

    class_labels = ['Deficit', 'Normal', 'Excess']
    cm = confusion_matrix(y_test_class, y_pred_class, labels=class_labels)
    acc = accuracy_score(y_test_class, y_pred_class)
    f1 = f1_score(y_test_class, y_pred_class, average='macro')

    classification_benchmark = {
        "model_name": "Random Forest Risk Classifier",
        "target": "Monsoon Risk Category (Deficit, Normal, Excess)",
        "accuracy": round(float(acc), 4),
        "macro_f1": round(float(f1), 4),
        "class_labels": class_labels,
        "confusion_matrix": cm.tolist()
    }

    # ==========================================
    # 5. Feature Importance Extraction
    # ==========================================
    rf_monsoon = trained_pipelines['Random Forest Regressor'].named_steps['reg']
    ohe = trained_pipelines['Random Forest Regressor'].named_steps['prep'].named_transformers_['cat']
    encoded_cat_names = ohe.get_feature_names_out(categorical_features).tolist()
    all_feature_names = numeric_features + encoded_cat_names

    importances = rf_monsoon.feature_importances_
    feat_imp = []
    for name, imp in zip(all_feature_names, importances):
        feat_imp.append({
            "feature": name,
            "importance": round(float(imp), 4),
            "percentage": round(float(imp * 100), 2)
        })

    feat_imp = sorted(feat_imp, key=lambda x: x['importance'], reverse=True)

    # Grouped importance (by core factor)
    grouped_imp = {
        "Subdivision Baseline (LPA)": 0.0,
        "Pre-Monsoon Rainfall (Mar-May)": 0.0,
        "Winter Rainfall (Jan-Feb)": 0.0,
        "Recent 3-Year Rolling Mean": 0.0,
        "Previous Year Lag (Lag-1)": 0.0,
        "Pre-Monsoon / Winter Ratio": 0.0,
        "Regional & Climate Zone Encodings": 0.0
    }

    for item in feat_imp:
        f = item['feature']
        v = item['importance']
        if f == 'SUBDIVISION_LPA_MONSOON':
            grouped_imp["Subdivision Baseline (LPA)"] += v
        elif f == 'Mar-May':
            grouped_imp["Pre-Monsoon Rainfall (Mar-May)"] += v
        elif f == 'Jan-Feb':
            grouped_imp["Winter Rainfall (Jan-Feb)"] += v
        elif f == 'ROLLING_3YR_MONSOON':
            grouped_imp["Recent 3-Year Rolling Mean"] += v
        elif f == 'LAG_1_MONSOON':
            grouped_imp["Previous Year Lag (Lag-1)"] += v
        elif f == 'PRE_MONSOON_RATIO':
            grouped_imp["Pre-Monsoon / Winter Ratio"] += v
        else:
            grouped_imp["Regional & Climate Zone Encodings"] += v

    grouped_imp = [{
        "factor": k,
        "percentage": round(v * 100, 2)
    } for k, v in grouped_imp.items()]
    grouped_imp = sorted(grouped_imp, key=lambda x: x['percentage'], reverse=True)

    # ==========================================
    # 6. Save Model Artifacts & Benchmarks
    # ==========================================
    metrics_summary = {
        "regression_benchmarks": regression_benchmarks,
        "annual_benchmark": annual_benchmark,
        "classification_benchmark": classification_benchmark,
        "best_monsoon_model": regression_benchmarks[best_idx]['model_name']
    }

    with open(os.path.join(models_dir, 'model_metrics.json'), 'w', encoding='utf-8') as f:
        json.dump(metrics_summary, f, indent=2, cls=NpEncoder)

    with open(os.path.join(models_dir, 'feature_importance.json'), 'w', encoding='utf-8') as f:
        json.dump({"top_features": feat_imp[:15], "grouped_factors": grouped_imp}, f, indent=2, cls=NpEncoder)

    # Save joblib models for Python server / offline inference
    joblib.dump(trained_pipelines['Random Forest Regressor'], os.path.join(models_dir, 'monsoon_rf_model.joblib'))
    joblib.dump(annual_pipeline, os.path.join(models_dir, 'annual_rf_model.joblib'))
    joblib.dump(clf_pipeline, os.path.join(models_dir, 'risk_rf_classifier.joblib'))
    print("Serialized joblib model files saved.")

    # ==========================================
    # 7. Export Client-Side Inference Weights
    # ==========================================
    # Extract Ridge regression coefficients and intercept for instant in-browser linear prediction
    ridge_model = trained_pipelines['Ridge Regression (L2)'].named_steps['reg']
    scaler = trained_pipelines['Ridge Regression (L2)'].named_steps['prep'].named_transformers_['num']

    model_weights = {
        "scaler_means": scaler.mean_.tolist(),
        "scaler_scales": scaler.scale_.tolist(),
        "numeric_feature_names": numeric_features,
        "ridge_intercept": float(ridge_model.intercept_),
        "ridge_coefs": ridge_model.coef_.tolist(),
        "feature_names": all_feature_names,
        "best_rf_mae_mm": regression_benchmarks[best_idx]['test_mae_mm'],
        "best_rf_r2": regression_benchmarks[best_idx]['test_r2'],
        "best_rf_rmse_mm": regression_benchmarks[best_idx]['test_rmse_mm']
    }

    with open(os.path.join(models_dir, 'model_weights.json'), 'w', encoding='utf-8') as f:
        json.dump(model_weights, f, indent=2, cls=NpEncoder)

    print("Model weights exported for zero-latency client/edge inference!")
    print("Training and benchmarking completed successfully!")

if __name__ == '__main__':
    main()
