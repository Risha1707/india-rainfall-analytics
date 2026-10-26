"""
export_frontend_data.py
Packages all trained model metrics, subdivision stats, decadal records,
and model weights into a clean ES module for the React frontend.
"""

import os
import json

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, 'models')
    data_dir = os.path.join(base_dir, 'data')
    src_data_dir = os.path.join(base_dir, 'src', 'data')
    public_dir = os.path.join(base_dir, 'public')
    os.makedirs(src_data_dir, exist_ok=True)
    os.makedirs(public_dir, exist_ok=True)

    def read_json(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    metrics = read_json(os.path.join(models_dir, 'model_metrics.json'))
    feat_imp = read_json(os.path.join(models_dir, 'feature_importance.json'))
    decadal = read_json(os.path.join(models_dir, 'decadal_trends.json'))
    seasonal = read_json(os.path.join(models_dir, 'seasonal_distribution.json'))
    sub_stats = read_json(os.path.join(models_dir, 'subdivision_stats.json'))
    corr = read_json(os.path.join(models_dir, 'correlation_matrix.json'))
    extremes = read_json(os.path.join(models_dir, 'historical_extremes.json'))
    weights = read_json(os.path.join(models_dir, 'model_weights.json'))
    metadata = read_json(os.path.join(data_dir, 'dataset_metadata.json'))

    # Save public summary
    public_summary = {
        "metadata": metadata,
        "metrics": metrics,
        "seasonal": seasonal,
        "extremes": extremes
    }
    with open(os.path.join(public_dir, 'data-summary.json'), 'w', encoding='utf-8') as f:
        json.dump(public_summary, f, indent=2)

    # Write ES Module
    js_content = f"""// Generated automatically by scripts/export_frontend_data.py
// Real-world, non-fabricated metrics from 115 years of IMD data.gov.in records

export const DATASET_METADATA = {json.dumps(metadata, indent=2)};

export const MODEL_METRICS = {json.dumps(metrics, indent=2)};

export const FEATURE_IMPORTANCE = {json.dumps(feat_imp, indent=2)};

export const DECADAL_TRENDS = {json.dumps(decadal, indent=2)};

export const SEASONAL_DISTRIBUTION = {json.dumps(seasonal, indent=2)};

export const SUBDIVISION_STATS = {json.dumps(sub_stats, indent=2)};

export const CORRELATION_MATRIX = {json.dumps(corr, indent=2)};

export const HISTORICAL_EXTREMES = {json.dumps(extremes, indent=2)};

export const MODEL_WEIGHTS = {json.dumps(weights, indent=2)};
"""

    out_file = os.path.join(src_data_dir, 'climateData.js')
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"climateData.js written to: {out_file} (Size: {len(js_content)} bytes)")

if __name__ == '__main__':
    main()
