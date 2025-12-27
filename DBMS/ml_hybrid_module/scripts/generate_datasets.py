"""
Script: generate_datasets.py
Purpose: Generate synthetic datasets for Kidney, Heart, Liver, and Cornea organ matching.
Author: Your Name
Date: 2025-12-19

- Each dataset row = one donor–patient pair
- Medical logic: higher compatibility/urgency = higher match_score, larger distance = lower match_score
- Saves one CSV per organ in ../data/
"""

import numpy as np
import pandas as pd
import random
from math import radians, sin, cos, sqrt, atan2
import os

# --- Utility: Haversine distance ---
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dlambda/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

# --- Common columns ---
def random_geo():
    # India bounding box (approx)
    lat = random.uniform(8.0, 37.0)
    lon = random.uniform(68.0, 97.0)
    return lat, lon

def generate_common(n, organ_type):
    data = []
    for i in range(n):
        donor_id = f"D{organ_type[0]}{i+1:03d}"
        patient_id = f"P{organ_type[0]}{i+1:03d}"
        donor_lat, donor_lon = random_geo()
        patient_lat, patient_lon = random_geo()
        distance_km = haversine(donor_lat, donor_lon, patient_lat, patient_lon)
        urgency_level = random.randint(1, 5)
        row = {
            'donor_id': donor_id,
            'patient_id': patient_id,
            'organ_type': organ_type,
            'donor_latitude': donor_lat,
            'donor_longitude': donor_lon,
            'patient_latitude': patient_lat,
            'patient_longitude': patient_lon,
            'distance_km': round(distance_km, 2),
            'urgency_level': urgency_level
        }
        data.append(row)
    return data

# --- Organ-specific data generators ---
def kidney_features(row):
    hla_score = random.uniform(0.4, 1.0)
    renal_score = random.uniform(0.4, 1.0)
    imaging_score = random.uniform(0.4, 1.0)
    cardiac_score = random.uniform(0.4, 1.0)
    # Only these features are sent by Node.js for kidney
    match_score = (
        0.3 * hla_score +
        0.25 * renal_score +
        0.15 * imaging_score +
        0.15 * cardiac_score +
        0.075 * (1 - row['distance_km']/1500) +
        0.075 * (row['urgency_level']/5)
    )
    match_score = min(max(match_score, 0.4), 1.0)
    row.update({
        'hla_score': round(hla_score, 2),
        'renal_score': round(renal_score, 2),
        'imaging_score': round(imaging_score, 2),
        'cardiac_score': round(cardiac_score, 2),
        'distance_km': row['distance_km'],
        'urgency_level': row['urgency_level'],
        'match_score': round(match_score, 3)
    })
    # Remove unused columns
    for k in ['donor_id','patient_id','organ_type','donor_latitude','donor_longitude','patient_latitude','patient_longitude']:
        row.pop(k, None)
    return row

def heart_features(row):
    blood_compat_score = random.uniform(0.4, 1.0)
    echo_score = random.uniform(0.4, 1.0)
    angiography_score = random.uniform(0.4, 1.0)
    viral_score = random.uniform(0.4, 1.0)
    cardiac_risk_score = random.uniform(0.4, 1.0)
    match_score = (
        0.2 * blood_compat_score +
        0.2 * echo_score +
        0.2 * angiography_score +
        0.15 * viral_score +
        0.15 * cardiac_risk_score +
        0.05 * (1 - row['distance_km']/1500) +
        0.05 * (row['urgency_level']/5)
    )
    match_score = min(max(match_score, 0.4), 1.0)
    row.update({
        'blood_compat_score': round(blood_compat_score, 2),
        'echo_score': round(echo_score, 2),
        'angiography_score': round(angiography_score, 2),
        'viral_score': round(viral_score, 2),
        'cardiac_risk_score': round(cardiac_risk_score, 2),
        'distance_km': row['distance_km'],
        'urgency_level': row['urgency_level'],
        'match_score': round(match_score, 3)
    })
    for k in ['donor_id','patient_id','organ_type','donor_latitude','donor_longitude','patient_latitude','patient_longitude']:
        row.pop(k, None)
    return row

def liver_features(row):
    blood_compat_score = random.uniform(0.4, 1.0)
    liver_function_score = random.uniform(0.4, 1.0)
    imaging_score = random.uniform(0.4, 1.0)
    viral_score = random.uniform(0.4, 1.0)
    coagulation_score = random.uniform(0.4, 1.0)
    match_score = (
        0.2 * blood_compat_score +
        0.2 * liver_function_score +
        0.2 * imaging_score +
        0.2 * viral_score +
        0.1 * coagulation_score +
        0.05 * (1 - row['distance_km']/1500) +
        0.05 * (row['urgency_level']/5)
    )
    match_score = min(max(match_score, 0.4), 1.0)
    row.update({
        'blood_compat_score': round(blood_compat_score, 2),
        'liver_function_score': round(liver_function_score, 2),
        'imaging_score': round(imaging_score, 2),
        'viral_score': round(viral_score, 2),
        'coagulation_score': round(coagulation_score, 2),
        'distance_km': row['distance_km'],
        'urgency_level': row['urgency_level'],
        'match_score': round(match_score, 3)
    })
    for k in ['donor_id','patient_id','organ_type','donor_latitude','donor_longitude','patient_latitude','patient_longitude']:
        row.pop(k, None)
    return row

def cornea_features(row):
    infection_score = random.uniform(0.4, 1.0)
    eye_health_score = random.uniform(0.4, 1.0)
    serology_score = random.uniform(0.4, 1.0)
    match_score = (
        0.35 * infection_score +
        0.35 * eye_health_score +
        0.2 * serology_score +
        0.05 * (1 - row['distance_km']/1500) +
        0.05 * (row['urgency_level']/5)
    )
    match_score = min(max(match_score, 0.4), 1.0)
    row.update({
        'infection_score': round(infection_score, 2),
        'eye_health_score': round(eye_health_score, 2),
        'serology_score': round(serology_score, 2),
        'distance_km': row['distance_km'],
        'urgency_level': row['urgency_level'],
        'match_score': round(match_score, 3)
    })
    for k in ['donor_id','patient_id','organ_type','donor_latitude','donor_longitude','patient_latitude','patient_longitude']:
        row.pop(k, None)
    return row

# --- Main dataset generation ---
def generate_and_save(organ, n, feature_func, filename):
    base = generate_common(n, organ)
    rows = [feature_func(row) for row in base]
    df = pd.DataFrame(rows)
    # Ensure data directory exists
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))
    os.makedirs(data_dir, exist_ok=True)
    abs_filename = os.path.join(data_dir, os.path.basename(filename))
    df.to_csv(abs_filename, index=False)
    print(f"Saved {organ} dataset to {abs_filename} (rows: {n})")
    print(df.head(3))

if __name__ == "__main__":
    random.seed(42)
    np.random.seed(42)
    generate_and_save('Kidney', 1_000_000, kidney_features, 'kidney.csv')
    generate_and_save('Heart', 1_000_000, heart_features, 'heart.csv')
    generate_and_save('Liver', 1_000_000, liver_features, 'liver.csv')
    generate_and_save('Cornea', 1_000_000, cornea_features, 'cornea.csv')
