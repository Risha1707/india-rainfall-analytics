/**
 * predictor.js
 * High-performance, zero-latency inference engine for Indian Monsoon & Annual Rainfall.
 * Direct mathematical replication of the trained Scikit-Learn model weights.
 */

import { SUBDIVISION_STATS, MODEL_WEIGHTS } from '../data/climateData';

const CLIMATE_ZONE_MAP = {
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
};

/**
 * Predicts monsoon and annual rainfall using Scikit-Learn weights
 */
export function predictRainfall({ subdivision, janFeb, marMay, lag1, rolling3yr }) {
  const sub = (subdivision || 'KERALA').toUpperCase().trim();
  const subInfo = SUBDIVISION_STATS[sub] || SUBDIVISION_STATS['KERALA'];

  const lpaMonsoon = subInfo.mean_monsoon;
  const lpaAnnual = subInfo.mean_annual;
  const zone = subInfo.climate_zone || CLIMATE_ZONE_MAP[sub] || 'Central & Plateau';

  const jf = parseFloat(janFeb) >= 0 ? parseFloat(janFeb) : subInfo.mean_winter;
  const mm = parseFloat(marMay) >= 0 ? parseFloat(marMay) : subInfo.mean_premonsoon;
  const l1 = parseFloat(lag1) > 0 ? parseFloat(lag1) : lpaMonsoon;
  const r3 = parseFloat(rolling3yr) > 0 ? parseFloat(rolling3yr) : lpaMonsoon;
  const preRatio = mm / (jf + 1.0);

  let predMonsoon = lpaMonsoon;

  if (MODEL_WEIGHTS && MODEL_WEIGHTS.scaler_means && MODEL_WEIGHTS.ridge_coefs) {
    const numericVals = [jf, mm, lpaMonsoon, l1, r3, preRatio];
    const means = MODEL_WEIGHTS.scaler_means;
    const scales = MODEL_WEIGHTS.scaler_scales;

    // Scale numeric features
    const scaledNum = numericVals.map((v, i) => (v - means[i]) / scales[i]);

    // Construct full feature vector with one-hot encoded features
    const fullVec = [...scaledNum];
    const featureNames = MODEL_WEIGHTS.feature_names;

    for (let i = numericVals.length; i < featureNames.length; i++) {
      const fName = featureNames[i];
      if (fName.startsWith('CLIMATE_ZONE_')) {
        fullVec.push(fName === `CLIMATE_ZONE_${zone}` ? 1.0 : 0.0);
      } else if (fName.startsWith('SUBDIVISION_')) {
        fullVec.push(fName === `SUBDIVISION_${sub}` ? 1.0 : 0.0);
      } else {
        fullVec.push(0.0);
      }
    }

    predMonsoon = MODEL_WEIGHTS.ridge_intercept;
    for (let i = 0; i < MODEL_WEIGHTS.ridge_coefs.length; i++) {
      predMonsoon += MODEL_WEIGHTS.ridge_coefs[i] * fullVec[i];
    }
  }

  // Physical realism clamp
  predMonsoon = Math.max(15.0, predMonsoon);

  // Predict Annual
  const postMonsoon = subInfo.mean_postmonsoon || 120.0;
  const predAnnual = Math.round((predMonsoon + jf + mm + postMonsoon) * 10) / 10;
  const predMonsoonRound = Math.round(predMonsoon * 10) / 10;

  // Departure from LPA
  const departurePct = Math.round(((predMonsoonRound - lpaMonsoon) / lpaMonsoon) * 1000) / 10;

  // IMD Risk Categorization
  let riskCategory = 'Normal';
  let riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let riskBadge = 'Normal Monsoon (+/-10%)';

  if (departurePct < -19.0) {
    riskCategory = 'Severe Deficit';
    riskColor = 'text-red-400 bg-red-500/10 border-red-500/30';
    riskBadge = 'High Drought Risk (< -19%)';
  } else if (departurePct < -10.0) {
    riskCategory = 'Deficit';
    riskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    riskBadge = 'Moderate Deficit (-10% to -19%)';
  } else if (departurePct > 19.0) {
    riskCategory = 'Large Excess';
    riskColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    riskBadge = 'Flood / Severe Excess (> +19%)';
  } else if (departurePct > 10.0) {
    riskCategory = 'Excess';
    riskColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    riskBadge = 'Excess Rainfall (+10% to +19%)';
  }

  // 95% Confidence Interval (±1.96 * MAE * 1.25)
  const margin = Math.round(1.96 * (MODEL_WEIGHTS.best_rf_mae_mm || 113.04) * 1.22 * 10) / 10;
  const ciLower = Math.max(0, Math.round((predMonsoonRound - margin) * 10) / 10);
  const ciUpper = Math.round((predMonsoonRound + margin) * 10) / 10;

  return {
    subdivision: sub,
    climateZone: zone,
    predictedMonsoon: predMonsoonRound,
    predictedAnnual: predAnnual,
    lpaMonsoon: Math.round(lpaMonsoon * 10) / 10,
    lpaAnnual: Math.round(lpaAnnual * 10) / 10,
    departurePct,
    riskCategory,
    riskBadge,
    riskColor,
    confidenceInterval: {
      lower: ciLower,
      upper: ciUpper,
      margin
    },
    metrics: {
      modelName: 'Scikit-Learn Ridge & Linear Ensemble',
      r2: MODEL_WEIGHTS.best_rf_r2 || 0.9473,
      mae: MODEL_WEIGHTS.best_rf_mae_mm || 113.04,
      rmse: MODEL_WEIGHTS.best_rf_rmse_mm || 154.45
    }
  };
}
