"""
AI Diet Planner - Data Preprocessing & Feature Engineering Module.

This script loads, cleans, merges, and performs feature engineering on both the
Food Nutrition and Indian Food Nutrition datasets, saving the clean output.
"""

import os
import pandas as pd
import numpy as np

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
PROCESSED_DIR = os.path.join(DATASET_DIR, "processed")

os.makedirs(PROCESSED_DIR, exist_ok=True)

US_DATA_PATH = os.path.join(DATASET_DIR, "Food_Nutrition_Dataset.csv")
INDIAN_DATA_PATH = os.path.join(DATASET_DIR, "indian_food_nutrition_calories - Sheet1.csv")
OUTPUT_PATH = os.path.join(PROCESSED_DIR, "cleaned_nutrition.csv")


def load_and_preprocess() -> None:
    print("Starting dataset analysis and data cleaning pipeline...")
    
    # 1. Load Datasets
    if not os.path.exists(US_DATA_PATH):
        raise FileNotFoundError(f"Missing US Nutrition dataset at {US_DATA_PATH}")
    if not os.path.exists(INDIAN_DATA_PATH):
        raise FileNotFoundError(f"Missing Indian Nutrition dataset at {INDIAN_DATA_PATH}")

    us_df = pd.read_csv(US_DATA_PATH)
    in_df = pd.read_csv(INDIAN_DATA_PATH)

    print(f"Loaded US Dataset: {us_df.shape[0]} rows, {us_df.shape[1]} columns")
    print(f"Loaded Indian Dataset: {in_df.shape[0]} rows, {in_df.shape[1]} columns")

    # 2. Clean US Dataset
    # Columns: food_name, category, calories, protein, carbs, fat, iron, vitamin_c
    us_df.dropna(subset=["food_name"], inplace=True)
    us_df.drop_duplicates(subset=["food_name"], inplace=True)
    
    # Standardize values: handle negatives
    for col in ["calories", "protein", "carbs", "fat", "iron", "vitamin_c"]:
        us_df[col] = pd.to_numeric(us_df[col], errors="coerce").fillna(0.0)
        us_df[col] = us_df[col].clip(lower=0.0) # Remove negative values

    # Add missing columns for merge compatibility
    us_df["fiber"] = 0.0
    us_df["sugar"] = 0.0
    us_df["sodium"] = 0.0
    us_df["potassium"] = 0.0
    us_df["calcium"] = 0.0
    us_df["is_indian"] = False
    us_df["region"] = "International"
    us_df["cooking_method"] = "Various"
    us_df["spice_level"] = "Mild"

    # Rename US columns to match target
    us_clean = us_df[[
        "food_name", "category", "calories", "protein", "carbs", "fat",
        "fiber", "sugar", "sodium", "potassium", "vitamin_c", "calcium",
        "iron", "is_indian", "region", "cooking_method", "spice_level"
    ]].copy()

    # 3. Clean Indian Dataset
    # Columns: Food_Item,Category,Calories_per_100g,Protein_g,Fat_g,Carbs_g,Fiber_g,Sugar_g,Sodium_mg,Potassium_mg,Vitamin_C_mg,Calcium_mg,Iron_mg,Spice_Level,Cooking_Method,Region
    in_df.rename(columns={
        "Food_Item": "food_name",
        "Category": "category",
        "Calories_per_100g": "calories",
        "Protein_g": "protein",
        "Fat_g": "fat",
        "Carbs_g": "carbs",
        "Fiber_g": "fiber",
        "Sugar_g": "sugar",
        "Sodium_mg": "sodium",
        "Potassium_mg": "potassium",
        "Vitamin_C_mg": "vitamin_c",
        "Calcium_mg": "calcium",
        "Iron_mg": "iron",
        "Spice_Level": "spice_level",
        "Cooking_Method": "cooking_method",
        "Region": "region"
    }, inplace=True)

    in_df.dropna(subset=["food_name"], inplace=True)
    in_df.drop_duplicates(subset=["food_name"], inplace=True)

    for col in ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium", "potassium", "vitamin_c", "calcium", "iron"]:
        in_df[col] = pd.to_numeric(in_df[col], errors="coerce").fillna(0.0)
        in_df[col] = in_df[col].clip(lower=0.0)

    in_df["is_indian"] = True

    in_clean = in_df[[
        "food_name", "category", "calories", "protein", "carbs", "fat",
        "fiber", "sugar", "sodium", "potassium", "vitamin_c", "calcium",
        "iron", "is_indian", "region", "cooking_method", "spice_level"
    ]].copy()

    # 4. Merge Datasets
    merged_df = pd.concat([us_clean, in_clean], ignore_index=True)
    merged_df.drop_duplicates(subset=["food_name"], inplace=True)
    print(f"Merged Dataset: {merged_df.shape[0]} unique food items")

    # 5. Sanitize wrong calories
    # Calories should be approximately: (protein * 4) + (carbs * 4) + (fat * 9)
    # If the database value is zero or completely off, we recalculate it
    calculated_calories = (merged_df["protein"] * 4) + (merged_df["carbs"] * 4) + (merged_df["fat"] * 9)
    merged_df["calories"] = np.where(
        (merged_df["calories"] < 5.0) & (calculated_calories > 10.0),
        calculated_calories,
        merged_df["calories"]
    )

    # 6. Feature Engineering
    print("Performing feature engineering on nutrition data...")
    total_macros = merged_df["protein"] + merged_df["carbs"] + merged_df["fat"] + 1e-5
    
    merged_df["protein_ratio"] = round(merged_df["protein"] / total_macros, 3)
    merged_df["fat_ratio"] = round(merged_df["fat"] / total_macros, 3)
    merged_df["carb_ratio"] = round(merged_df["carbs"] / total_macros, 3)
    
    # Health Score: Based on positive (protein, fiber, vitamin C) and negative (sugar, sodium, saturated fat)
    # Scale from 0 to 100
    score = (
        (merged_df["protein"] * 3) + 
        (merged_df["fiber"] * 5) + 
        (merged_df["vitamin_c"] * 0.2) - 
        (merged_df["sugar"] * 2) - 
        (merged_df["fat"] * 1) - 
        (merged_df["sodium"] / 100.0) + 40
    )
    merged_df["health_score"] = round(score.clip(lower=0.0, upper=100.0), 1)

    # Diet Friendly Category Flags
    merged_df["diabetic_friendly"] = (merged_df["sugar"] < 6.0) & (merged_df["carbs"] < 25.0)
    merged_df["heart_friendly"] = (merged_df["fat"] < 12.0) & (merged_df["sodium"] < 400.0)
    merged_df["weight_loss_friendly"] = (merged_df["calories"] < 220.0) & (merged_df["fiber"] >= 1.5)
    merged_df["muscle_gain_friendly"] = (merged_df["protein"] >= 12.0)
    
    # Categorize BMI friendly category
    # Foods friendly for underweight (high calorie dense), normal (balanced), obese (low calorie dense)
    merged_df["bmi_friendly_category"] = np.select(
        condlist=[
            (merged_df["calories"] < 150),
            (merged_df["calories"] >= 150) & (merged_df["calories"] < 350),
            (merged_df["calories"] >= 350)
        ],
        choicelist=["low_density", "moderate_density", "high_density"],
        default="moderate_density"
    )

    # Export Processed Dataset
    merged_df.to_csv(OUTPUT_PATH, index=False)
    print(f"Dataset successfully cleaned and saved to: {OUTPUT_PATH}")


if __name__ == "__main__":
    load_and_preprocess()
