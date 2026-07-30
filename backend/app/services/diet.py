"""
AI Diet Planner Service Module.

Handles calculations (BMI, BMR, TDEE, macros), seeds the food database from CSV,
and manages meal plan recommendations using the trained ML model.
"""

import os
import random
import joblib
import pandas as pd
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.logger import get_logger
from app.models.diet import FoodItem, MealPlan, BMIHistory
from app.repositories.diet import (
    food_repository,
    meal_plan_repository,
    bmi_history_repository
)

logger = get_logger(__name__)

# Base Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CLEANED_DATA_PATH = os.path.join(BASE_DIR, "dataset", "processed", "cleaned_nutrition.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "diet_recommendation_model.pkl")


class DietService:
    """Service encapsulating diet recommendation algorithms and database seeding."""

    def __init__(self) -> None:
        self.model_data = None
        self.load_ml_model()

    def load_ml_model(self) -> None:
        """Load the pre-trained Gradient Boosting or Decision Tree classification model."""
        if os.path.exists(MODEL_PATH):
            try:
                self.model_data = joblib.load(MODEL_PATH)
                logger.info(f"Loaded diet classification model. Algorithm: {self.model_data.get('algorithm_used')}")
            except Exception as e:
                logger.error(f"Error loading diet recommendation model: {e}")
        else:
            logger.warning(f"Diet recommendation model file absent at {MODEL_PATH}. Recommendations will use fallback rules.")

    def seed_food_database(self, db: Session) -> None:
        """Seeds the database food_items table from cleaned_nutrition.csv if empty."""
        try:
            # Check if database already has foods
            existing_count = db.query(FoodItem).count()
            if existing_count > 0:
                logger.debug(f"Food database already seeded. Count: {existing_count} items.")
                return

            if not os.path.exists(CLEANED_DATA_PATH):
                logger.error(f"Cleaned nutrition CSV absent at {CLEANED_DATA_PATH}. Seeding aborted.")
                return

            logger.info("Seeding food database from cleaned CSV...")
            df = pd.read_csv(CLEANED_DATA_PATH)
            
            # Fill missing columns/values
            df.fillna({
                "calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0,
                "fiber": 0.0, "sugar": 0.0, "sodium": 0.0, "potassium": 0.0,
                "vitamin_c": 0.0, "calcium": 0.0, "iron": 0.0, "region": "International",
                "cooking_method": "Various", "spice_level": "Mild"
            }, inplace=True)

            food_items = []
            for _, row in df.iterrows():
                food_obj = FoodItem(
                    food_name=str(row["food_name"]),
                    category=str(row["category"]),
                    calories=float(row["calories"]),
                    protein=float(row["protein"]),
                    carbs=float(row["carbs"]),
                    fat=float(row["fat"]),
                    fiber=float(row["fiber"]),
                    sugar=float(row["sugar"]),
                    sodium=float(row["sodium"]),
                    potassium=float(row["potassium"]),
                    vitamin_c=float(row["vitamin_c"]),
                    calcium=float(row["calcium"]),
                    iron=float(row["iron"]),
                    is_indian=bool(row["is_indian"]),
                    region=str(row["region"]),
                    cooking_method=str(row["cooking_method"]),
                    spice_level=str(row["spice_level"]),
                    protein_ratio=float(row["protein_ratio"]),
                    fat_ratio=float(row["fat_ratio"]),
                    carb_ratio=float(row["carb_ratio"]),
                    health_score=float(row["health_score"]),
                    diabetic_friendly=bool(row["diabetic_friendly"]),
                    heart_friendly=bool(row["heart_friendly"]),
                    weight_loss_friendly=bool(row["weight_loss_friendly"]),
                    muscle_gain_friendly=bool(row["muscle_gain_friendly"]),
                    bmi_friendly_category=str(row["bmi_friendly_category"])
                )
                food_items.append(food_obj)

            # Bulk save
            db.bulk_save_objects(food_items)
            db.commit()
            logger.info(f"Successfully seeded {len(food_items)} food items into the database.")
        except Exception as e:
            logger.error(f"Error seeding food database: {e}", exc_info=True)
            db.rollback()

    def calculate_bmi(self, weight_kg: float, height_cm: float) -> Dict[str, Any]:
        """Calculate Body Mass Index (BMI) and classify categories."""
        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m ** 2), 2)
        
        if bmi < 18.5:
            classification = "Underweight"
        elif bmi < 25.0:
            classification = "Normal"
        elif bmi < 30.0:
            classification = "Overweight"
        else:
            classification = "Obese"
            
        return {"bmi": bmi, "classification": classification}

    def calculate_bmr(self, weight_kg: float, height_cm: float, age: int, gender: str) -> float:
        """Calculate Basal Metabolic Rate (BMR) using Mifflin St Jeor Equation."""
        if gender.lower() == "male":
            return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
        else:
            return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    def calculate_tdee(self, bmr: float, activity_level: str) -> float:
        """Calculate Total Daily Energy Expenditure (TDEE) using activity multipliers."""
        multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "extra_active": 1.9
        }
        factor = multipliers.get(activity_level.lower(), 1.2)
        return round(bmr * factor, 1)

    def calculate_macronutrients(self, weight_kg: float, target_calories: float, goal: str) -> Dict[str, float]:
        """Compute target macro metrics (proteins, carbs, fats) based on goal."""
        goal = goal.lower()
        
        # Protein multiplier guidelines
        if "muscle_gain" in goal or "weight_gain" in goal:
            protein_g = weight_kg * 2.0
        elif "weight_loss" in goal or "fat_loss" in goal:
            protein_g = weight_kg * 1.8
        else:
            protein_g = weight_kg * 1.5
            
        protein_cal = protein_g * 4.0
        
        # Fat target: 25% of calories
        fat_cal = target_calories * 0.25
        fat_g = fat_cal / 9.0
        
        # Carbohydrates fill remainder
        carb_cal = target_calories - (protein_cal + fat_cal)
        carb_g = max(20.0, carb_cal / 4.0) # Ensure a minimum baseline

        return {
            "calories": round(target_calories, 1),
            "protein": round(protein_g, 1),
            "fat": round(fat_g, 1),
            "carbs": round(carb_g / 4.0 * 4.0, 1) # Normalization
        }

    def generate_recommendations(
        self,
        db: Session,
        *,
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: str,
        goal: str,
        activity_level: str,
        food_preference: str,
        allergies: List[str],
        medical_conditions: List[str],
        user_id: str
    ) -> MealPlan:
        """Dynamically generate user-friendly diet recommendations matching ML classifier."""
        logger.info(f"Generating meal recommendations. User ID: {user_id}")

        # 1. Base Calculators
        bmi_data = self.calculate_bmi(weight_kg, height_cm)
        bmr = self.calculate_bmr(weight_kg, height_cm, age, gender)
        tdee = self.calculate_tdee(bmr, activity_level)

        # Log BMI Record
        bmi_history_obj = BMIHistory(
            user_id=user_id,
            weight_kg=weight_kg,
            height_cm=height_cm,
            bmi=bmi_data["bmi"],
            classification=bmi_data["classification"]
        )
        bmi_history_repository.create(db, obj_in=bmi_history_obj)

        # 2. Daily Calorie Adjustment based on Goals
        goal = goal.lower()
        if "weight_loss" in goal:
            target_calories = tdee - 500.0
        elif "fat_loss" in goal:
            target_calories = tdee - 350.0
        elif "weight_gain" in goal:
            target_calories = tdee + 500.0
        elif "muscle_gain" in goal:
            target_calories = tdee + 350.0
        else:
            target_calories = tdee
            
        target_calories = max(1200.0, target_calories) # Safe baseline calories limits

        # 3. Macro target distributions
        macros = self.calculate_macronutrients(weight_kg, target_calories, goal)
        water_ml = round(weight_kg * 35.0, 0) # Water requirement formula

        # 4. Determine target ML category
        # Match target_diet tag: "muscle_gain", "diabetic", "weight_loss", "balanced"
        if "muscle_gain" in goal:
            target_diet_cat = "muscle_gain"
        elif "diabetes" in [m.lower() for m in medical_conditions]:
            target_diet_cat = "diabetic"
        elif "weight_loss" in goal or "fat_loss" in goal:
            target_diet_cat = "weight_loss"
        else:
            target_diet_cat = "balanced"

        # 5. Fetch and Filter foods from Database
        foods_query = db.query(FoodItem)
        
        # Veg Preference filter
        if food_preference.lower() == "veg":
            # Exclude Non-Veg items
            foods_query = foods_query.filter(FoodItem.category != "Non-Veg")
            foods_query = foods_query.filter(~FoodItem.food_name.ilike("%chicken%"))
            foods_query = foods_query.filter(~FoodItem.food_name.ilike("%fish%"))
            foods_query = foods_query.filter(~FoodItem.food_name.ilike("%beef%"))
            foods_query = foods_query.filter(~FoodItem.food_name.ilike("%pork%"))
            foods_query = foods_query.filter(~FoodItem.food_name.ilike("%mutton%"))

        # Allergies filter
        for allergy in allergies:
            allergy_str = allergy.strip().lower()
            if allergy_str:
                foods_query = foods_query.filter(~FoodItem.food_name.ilike(f"%{allergy_str}%"))
                foods_query = foods_query.filter(~FoodItem.category.ilike(f"%{allergy_str}%"))

        # Medical Conditions filter
        medical_conditions_clean = [m.lower() for m in medical_conditions]
        if "diabetes" in medical_conditions_clean:
            foods_query = foods_query.filter(FoodItem.diabetic_friendly == True)
        if "heart disease" in medical_conditions_clean or "hypertension" in medical_conditions_clean:
            foods_query = foods_query.filter(FoodItem.heart_friendly == True)

        all_valid_foods = foods_query.all()
        
        # If no foods left after filters, fallback to unrestricted category list
        if not all_valid_foods:
            all_valid_foods = db.query(FoodItem).limit(100).all()

        # 6. Separate foods into Breakfast, Lunch, Dinner, Snacks based on keywords
        breakfast_foods = []
        lunch_dinner_foods = []
        snack_foods = []

        breakfast_keywords = {"apple", "banana", "fruit", "juice", "oats", "cereal", "dosa", "idli", "bread", "egg"}
        snack_keywords = {"cake", "sweet", "baked", "snack", "beverage", "samosa", "pakora", "vada", "cookie", "crisp"}

        for food in all_valid_foods:
            name_lower = food.food_name.lower()
            cat_lower = food.category.lower()
            
            # Predict suitability using ML classifier if loaded, else use engineered tags
            is_preferred = False
            if self.model_data:
                try:
                    # Model features: ["calories", "protein", "carbs", "fat", "fiber", "sugar", "protein_ratio", "carb_ratio", "fat_ratio"]
                    features_list = [
                        food.calories, food.protein, food.carbs, food.fat, 
                        food.fiber, food.sugar, food.protein_ratio, food.carb_ratio, food.fat_ratio
                    ]
                    scaled_feats = self.model_data["scaler"].transform([features_list])
                    pred_cat_idx = self.model_data["model"].predict(scaled_feats)[0]
                    pred_diet_cat = self.model_data["label_encoder"].classes_[pred_cat_idx]
                    
                    if pred_diet_cat == target_diet_cat:
                        is_preferred = True
                except Exception:
                    # Fallback if prediction error
                    pass
            
            if not is_preferred:
                # Fallback to metadata boolean tags
                if target_diet_cat == "muscle_gain" and food.muscle_gain_friendly:
                    is_preferred = True
                elif target_diet_cat == "diabetic" and food.diabetic_friendly:
                    is_preferred = True
                elif target_diet_cat == "weight_loss" and food.weight_loss_friendly:
                    is_preferred = True
                elif target_diet_cat == "balanced":
                    is_preferred = True

            # Assign to meal times
            if any(k in name_lower or k in cat_lower for k in snack_keywords):
                snack_foods.append((food, is_preferred))
            elif any(k in name_lower or k in cat_lower for k in breakfast_keywords):
                breakfast_foods.append((food, is_preferred))
            else:
                lunch_dinner_foods.append((food, is_preferred))

        # Build fallback mappings if subsets are empty
        if not breakfast_foods:
            breakfast_foods = [(f, True) for f in all_valid_foods[:20]]
        if not lunch_dinner_foods:
            lunch_dinner_foods = [(f, True) for f in all_valid_foods[20:60]]
        if not snack_foods:
            snack_foods = [(f, True) for f in all_valid_foods[60:80]]

        # Helper selection function prioritizing preferred ML foods
        def select_foods(food_list, count=3):
            preferred = [f for f, pref in food_list if pref]
            regular = [f for f, pref in food_list if not pref]
            
            if len(preferred) >= count:
                selected = random.sample(preferred, count)
            else:
                selected = preferred + random.sample(regular, min(len(regular), count - len(preferred)))
                
            return [
                {
                    "id": f.id,
                    "food_name": f.food_name,
                    "category": f.category,
                    "calories": f.calories,
                    "protein": f.protein,
                    "carbs": f.carbs,
                    "fat": f.fat,
                    "fiber": f.fiber,
                    "sugar": f.sugar,
                    "sodium": f.sodium,
                    "potassium": f.potassium,
                    "vitamin_c": f.vitamin_c,
                    "calcium": f.calcium,
                    "iron": f.iron,
                    "is_indian": f.is_indian,
                    "region": f.region,
                    "health_score": f.health_score,
                    "diabetic_friendly": f.diabetic_friendly,
                    "heart_friendly": f.heart_friendly,
                    "weight_loss_friendly": f.weight_loss_friendly,
                    "muscle_gain_friendly": f.muscle_gain_friendly
                }
                for f in selected
            ]

        recommended_meals = {
            "breakfast": select_foods(breakfast_foods, 3),
            "lunch": select_foods(lunch_dinner_foods, 3),
            "dinner": select_foods(lunch_dinner_foods, 3),
            "snacks": select_foods(snack_foods, 2)
        }

        # 7. Persist Meal Plan
        meal_plan_obj = MealPlan(
            user_id=user_id,
            target_calories=macros["calories"],
            target_protein=macros["protein"],
            target_carbs=macros["carbs"],
            target_fat=macros["fat"],
            target_water_ml=water_ml,
            recommended_meals=recommended_meals
        )
        
        saved_plan = meal_plan_repository.create(db, obj_in=meal_plan_obj)
        logger.info(f"Meal plan recommendation generated and saved. ID: {saved_plan.id}")
        return saved_plan


# Singleton Diet Service
diet_service = DietService()
