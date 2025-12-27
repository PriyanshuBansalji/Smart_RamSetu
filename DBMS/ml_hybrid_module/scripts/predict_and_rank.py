"""
Script: predict_and_rank.py
Purpose: Predict match_score and rank donors for a given patient using trained models.
Author: Your Name
Date: 2025-12-19

- Loads the appropriate model (Kidney, Heart, Liver, Cornea)
- Accepts a list of donor–patient feature vectors (e.g., from a filtered DataFrame)
- Predicts match_score for each donor
- Ranks donors in descending order of match_score
- Returns top-N donors
"""


import pandas as pd
import joblib
import os

# --- Organ-specific feature columns ---
FEATURES = {
    'Kidney': [
        'hla_score', 'renal_score', 'imaging_score', 'cardiac_score',
        'donor_fitness_score', 'distance_km', 'urgency_level'
    ],
    'Heart': [
        'heart_function_score', 'artery_health_score', 'lung_support_score',
        'fitness_score', 'distance_km', 'urgency_level'
    ],
    'Liver': [
        'liver_health_score', 'clotting_score', 'residual_volume_score',
        'imaging_score', 'fitness_score', 'distance_km', 'urgency_level'
    ],
    'Cornea': [
        'cornea_quality_score', 'tissue_viability_score', 'infection_clearance_score',
        'distance_km', 'urgency_level'
    ]
}

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, '../data'))
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, '../models'))
MODEL_PATHS = {
    'Kidney': os.path.join(MODEL_DIR, 'kidney_model.joblib'),
    'Heart': os.path.join(MODEL_DIR, 'heart_model.joblib'),
    'Liver': os.path.join(MODEL_DIR, 'liver_model.joblib'),
    'Cornea': os.path.join(MODEL_DIR, 'cornea_model.joblib')
}

def predict_and_rank(organ, donor_patient_df, top_n=5):
    """
    donor_patient_df: DataFrame with all required features for the organ
    Returns: DataFrame with predicted match_score, sorted descending
    """
    model = joblib.load(MODEL_PATHS[organ])
    features = FEATURES[organ]
    X = donor_patient_df[features]
    donor_patient_df = donor_patient_df.copy()
    donor_patient_df['predicted_match_score'] = model.predict(X)
    ranked = donor_patient_df.sort_values('predicted_match_score', ascending=False)
    return ranked.head(top_n)

# --- Example usage ---
if __name__ == "__main__":
    # Example: Rank top 5 kidney donors for a patient
    organ = 'Kidney'
    df = pd.read_csv(os.path.join(DATA_DIR, 'kidney.csv'))
    # Simulate rule-based filtering (e.g., only donors with hla_score > 0.6)
    filtered = df[df['hla_score'] > 0.6].reset_index(drop=True)
    top_donors = predict_and_rank(organ, filtered, top_n=5)
    print("Top 5 ranked kidney donors:")
    print(top_donors[['donor_id', 'patient_id', 'predicted_match_score']])
