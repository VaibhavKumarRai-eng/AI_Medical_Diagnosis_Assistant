import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, X, Heart, ShieldAlert,
  Utensils, Clipboard, Coffee, Moon, Sun, Droplet, PlusCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { dietAPI } from '../services/api';

const DietPlanner = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Input states
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [goal, setGoal] = useState('muscle_gain');
  const [activity, setActivity] = useState('moderate');
  const [preference, setPreference] = useState('Veg');
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [medInput, setMedInput] = useState('');
  const [medicalConditions, setMedicalConditions] = useState([]);

  // App States
  const [latestPlan, setLatestPlan] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [bmiHistory, setBmiHistory] = useState([]);
  const [waterCount, setWaterCount] = useState(() => {
    const saved = localStorage.getItem('waterCount');
    const savedDate = localStorage.getItem('waterCountDate');
    const today = new Date().toDateString();
    if (saved && savedDate === today) {
      return parseInt(saved, 10);
    }
    return 0;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logModalOpen, setLogModalOpen] = useState(false);

  // Manual Meal Log Form
  const [logFoodName, setLogFoodName] = useState('');
  const [logMealType, setLogMealType] = useState('Breakfast');
  const [logCalories, setLogCalories] = useState('250');
  const [logProtein, setLogProtein] = useState('15');
  const [logCarbs, setLogCarbs] = useState('30');
  const [logFat, setLogFat] = useState('5');
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('waterCount', waterCount);
    localStorage.setItem('waterCountDate', new Date().toDateString());
  }, [waterCount]);

  const fetchInitialData = async () => {
    try {
      const plan = await dietAPI.getLatestPlan();
      if (plan) setLatestPlan(plan);
      
      const logs = await dietAPI.getMealHistory();
      setMealLogs(logs);

      const bmiHist = await dietAPI.getBmiHistory();
      setBmiHistory(bmiHist.reverse()); // Chronological order
    } catch (err) {
      console.error("Error fetching diet planner states:", err);
    }
  };

  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleAddMed = (e) => {
    e.preventDefault();
    if (medInput.trim() && !medicalConditions.includes(medInput.trim())) {
      setMedicalConditions([...medicalConditions, medInput.trim()]);
      setMedInput('');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      weight_kg: parseFloat(weight),
      height_cm: parseFloat(height),
      age: parseInt(age),
      gender,
      goal,
      activity_level: activity,
      food_preference: preference,
      allergies,
      medical_conditions: medicalConditions
    };

    try {
      const data = await dietAPI.generatePlan(payload);
      setLatestPlan(data);
      // Refresh historical datasets
      const bmiHist = await dietAPI.getBmiHistory();
      setBmiHistory(bmiHist.reverse());
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate personalized diet plan.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Log Recommended Meal
  const handleLogRecommendedFood = async (food, mealType) => {
    try {
      const payload = {
        food_name: food.food_name,
        meal_type: mealType,
        serving_count: 1.0,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
      };
      await dietAPI.logMeal(payload);
      // Refresh logs
      const logs = await dietAPI.getMealHistory();
      setMealLogs(logs);
    } catch (err) {
      console.error(err);
      alert("Failed to log food item");
    }
  };

  // Custom Log Form Submit
  const handleCustomLog = async (e) => {
    e.preventDefault();
    if (!logFoodName) return;
    setLogLoading(true);

    try {
      const payload = {
        food_name: logFoodName,
        meal_type: logMealType,
        serving_count: 1.0,
        calories: parseFloat(logCalories),
        protein: parseFloat(logProtein),
        carbs: parseFloat(logCarbs),
        fat: parseFloat(logFat)
      };
      await dietAPI.logMeal(payload);
      setLogModalOpen(false);
      setLogFoodName('');
      
      const logs = await dietAPI.getMealHistory();
      setMealLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLogLoading(false);
    }
  };

  // Delete Meal Log
  const handleDeleteMealLog = async (logId) => {
    try {
      await dietAPI.deleteMealLog(logId);
      const logs = await dietAPI.getMealHistory();
      setMealLogs(logs);
    } catch (err) {
      console.error(err);
      alert("Failed to delete meal log.");
    }
  };

  // Compute total values consumed today (filtering by local today's date)
  const totalsConsumed = mealLogs.reduce(
    (acc, curr) => {
      const logDate = new Date(curr.log_date);
      const today = new Date();
      if (logDate.toDateString() === today.toDateString()) {
        acc.calories += curr.calories;
        acc.protein += curr.protein;
        acc.carbs += curr.carbs;
        acc.fat += curr.fat;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Dynamic progress values
  const calPercent = latestPlan ? Math.min(100, (totalsConsumed.calories / latestPlan.target_calories) * 100) : 0;
  const protPercent = latestPlan ? Math.min(100, (totalsConsumed.protein / latestPlan.target_protein) * 100) : 0;
  const carbsPercent = latestPlan ? Math.min(100, (totalsConsumed.carbs / latestPlan.target_carbs) * 100) : 0;
  const fatPercent = latestPlan ? Math.min(100, (totalsConsumed.fat / latestPlan.target_fat) * 100) : 0;

  // Chart configs
  const pieData = latestPlan ? [
    { name: 'Protein', value: latestPlan.target_protein * 4 },
    { name: 'Carbohydrates', value: latestPlan.target_carbs * 4 },
    { name: 'Fats', value: latestPlan.target_fat * 9 },
  ] : [];

  const COLORS = ['#2563EB', '#10B981', '#F59E0B'];

  return (
    <div className={`max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-left relative transition-colors duration-300 ${
      isLight ? 'text-med-text' : 'text-gray-300'
    }`}>
      {/* Background Glowing Orbs */}
      <div className={`absolute top-20 left-[10%] w-80 h-80 rounded-full blur-[100px] pointer-events-none -z-10 opacity-70 ${
        isLight ? 'bg-med-secondary' : 'bg-primary/10'
      }`} />
      <div className={`absolute bottom-20 right-[10%] w-80 h-80 rounded-full blur-[100px] pointer-events-none -z-10 opacity-70 ${
        isLight ? 'bg-[#EEF0FF]' : 'bg-secondary/10'
      }`} />
      
      {/* Header Banner */}
      <div className={`border-b pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
        isLight ? 'border-med-secondary' : 'border-white/[0.06]'
      }`}>
        <div>
          <h1 className={`text-3xl font-extrabold flex items-center gap-3 transition-colors duration-300 ${
            isLight ? 'text-med-text' : 'text-white'
          }`}>
            <div className={`p-2 rounded-xl border shadow-[0_0_15px_rgba(37,99,235,0.15)] ${
              isLight ? 'bg-med-secondary border-med-primary/10 text-med-primary' : 'bg-primary/10 border-primary/20 text-primary'
            }`}>
              <Calculator className="h-6 w-6 text-current" />
            </div>
            AI Diet Recommendation & Planner
          </h1>
          <p className={`text-xs mt-1.5 ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
            Personalized macro targets and dynamic meal suggestions driven by clinical nutrition datasets.
          </p>
        </div>
        
        {latestPlan && (
          <button
            onClick={() => setLogModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/10 flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Log Meal Consumed
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Form */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-5 p-6 rounded-3xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
            isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${isLight ? 'text-med-text' : 'text-white'}`}>
            <Clipboard className="h-4.5 w-4.5 text-primary" />
            User Health Demographics
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            
            {/* Weight & Height */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Weight (kg)</label>
                <input
                  type="number"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-xs font-semibold"
                  placeholder="e.g. 70"
                />
              </div>
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Height (cm)</label>
                <input
                  type="number"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-xs font-semibold"
                  placeholder="e.g. 175"
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Age (Years)</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-xs font-semibold"
                  placeholder="e.g. 25"
                />
              </div>
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Gender</label>
                <div className={`grid grid-cols-2 gap-1 border rounded-xl p-1 ${
                  isLight ? 'bg-med-secondary border-med-primary/10' : 'bg-white/[0.02] border-white/10'
                }`}>
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer capitalize ${
                        gender === g 
                          ? 'bg-primary text-white shadow-md' 
                          : isLight 
                            ? 'text-med-gray hover:text-med-primary' 
                            : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Goal Selector */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-bold uppercase tracking-wider font-inter ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Fitness Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="glass-input w-full px-3 py-2 text-xs"
              >
                <option value="weight_loss" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Weight Loss (Cut)</option>
                <option value="fat_loss" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Targeted Fat Loss</option>
                <option value="maintain_weight" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Maintain Calorie Balance</option>
                <option value="muscle_gain" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Lean Muscle Gain</option>
                <option value="weight_gain" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Weight Gain (Bulk)</option>
              </select>
            </div>

            {/* Activity Level */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Activity Factor</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="glass-input w-full px-3 py-2 text-xs"
              >
                <option value="sedentary" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Sedentary (No Exercise)</option>
                <option value="light" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Lightly Active (1-3 days/week)</option>
                <option value="moderate" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Moderately Active (3-5 days/week)</option>
                <option value="active" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Highly Active (6-7 days/week)</option>
                <option value="extra_active" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Athlete / Heavy Physical Labor</option>
              </select>
            </div>

            {/* Preference */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Food Preference</label>
              <div className={`grid grid-cols-2 gap-1 border rounded-xl p-1 ${
                isLight ? 'bg-med-secondary border-med-primary/10' : 'bg-white/[0.02] border-white/10'
              }`}>
                {['Veg', 'Non-Veg'].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setPreference(pref)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      preference === pref 
                        ? 'bg-primary text-white shadow-md' 
                        : isLight 
                          ? 'text-med-gray hover:text-med-primary' 
                          : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Allergies Tags */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Allergies (Peanuts, Milk, Gluten, etc.)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  className="glass-input flex-1 px-3 py-1.5 text-xs"
                  placeholder="e.g. Peanut"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className={`px-3 border rounded-xl text-xs transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-med-secondary border-med-primary/10 text-med-primary hover:bg-med-primary hover:text-white' 
                      : 'bg-white/[0.03] border border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  Add
                </button>
              </div>
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {allergies.map((a, idx) => (
                    <span key={idx} className={`px-2 py-0.5 rounded-lg text-[9px] flex items-center gap-1 font-bold border ${
                      isLight ? 'bg-red-50 border-red-200 text-red-950' : 'bg-red-500/10 border-red-500/20 text-red-200'
                    }`}>
                      {a}
                      <X className="h-2.5 w-2.5 cursor-pointer text-red-500" onClick={() => setAllergies(allergies.filter(item => item !== a))} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Medical Conditions Tags */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Medical Conditions (Diabetes, Hypertension, etc.)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={medInput}
                  onChange={(e) => setMedInput(e.target.value)}
                  className="glass-input flex-1 px-3 py-1.5 text-xs"
                  placeholder="e.g. Diabetes"
                />
                <button
                  type="button"
                  onClick={handleAddMed}
                  className={`px-3 border rounded-xl text-xs transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-med-secondary border-med-primary/10 text-med-primary hover:bg-med-primary hover:text-white' 
                      : 'bg-white/[0.03] border border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  Add
                </button>
              </div>
              {medicalConditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {medicalConditions.map((m, idx) => (
                    <span key={idx} className={`px-2 py-0.5 rounded-lg text-[9px] flex items-center gap-1 font-bold border ${
                      isLight 
                        ? 'bg-med-secondary border-med-primary/15 text-med-primary' 
                        : 'bg-primary/10 border-primary/20 text-primary'
                    }`}>
                      {m}
                      <X className="h-2.5 w-2.5 cursor-pointer text-primary" onClick={() => setMedicalConditions(medicalConditions.filter(item => item !== m))} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-[10px] text-red-500 font-bold mt-2">{error}</p>}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 font-poppins"
              >
                {loading ? 'Analyzing Datasets & ML Engine...' : 'Generate Plan'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right Column: Calculations & Dashboard display */}
        <div className="lg:col-span-7 space-y-8">
          
          {latestPlan ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Daily Target Progress Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Calories Progress */}
                <div className={`p-4 rounded-2xl border text-center space-y-1 relative overflow-hidden transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                }`}>
                  <div className="absolute top-0 left-0 bottom-0 bg-primary/5 transition-all" style={{ width: `${calPercent}%` }} />
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Calories Target</p>
                  <p className={`text-base font-extrabold ${isLight ? 'text-med-text' : 'text-white'}`}>{Math.round(totalsConsumed.calories)} / {Math.round(latestPlan.target_calories)}</p>
                  <p className="text-[9px] text-primary font-bold">kcal ({Math.round(calPercent)}%)</p>
                </div>

                {/* Protein Progress */}
                <div className={`p-4 rounded-2xl border text-center space-y-1 relative overflow-hidden transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                }`}>
                  <div className="absolute top-0 left-0 bottom-0 bg-emerald-500/5 transition-all" style={{ width: `${protPercent}%` }} />
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Protein</p>
                  <p className={`text-base font-extrabold ${isLight ? 'text-med-text' : 'text-white'}`}>{Math.round(totalsConsumed.protein)}g / {Math.round(latestPlan.target_protein)}g</p>
                  <p className="text-[9px] text-emerald-500 dark:text-emerald-450 font-bold">({Math.round(protPercent)}%)</p>
                </div>

                {/* Carbs Progress */}
                <div className={`p-4 rounded-2xl border text-center space-y-1 relative overflow-hidden transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                }`}>
                  <div className="absolute top-0 left-0 bottom-0 bg-amber-500/5 transition-all" style={{ width: `${carbsPercent}%` }} />
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Carbohydrates</p>
                  <p className={`text-base font-extrabold ${isLight ? 'text-med-text' : 'text-white'}`}>{Math.round(totalsConsumed.carbs)}g / {Math.round(latestPlan.target_carbs)}g</p>
                  <p className="text-[9px] text-amber-500 dark:text-amber-450 font-bold">({Math.round(carbsPercent)}%)</p>
                </div>

                {/* Fats Progress */}
                <div className={`p-4 rounded-2xl border text-center space-y-1 relative overflow-hidden transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                }`}>
                  <div className="absolute top-0 left-0 bottom-0 bg-pink-500/5 transition-all" style={{ width: `${fatPercent}%` }} />
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Fats Target</p>
                  <p className={`text-base font-extrabold ${isLight ? 'text-med-text' : 'text-white'}`}>{Math.round(totalsConsumed.fat)}g / {Math.round(latestPlan.target_fat)}g</p>
                  <p className="text-[9px] text-pink-500 dark:text-pink-450 font-bold">({Math.round(fatPercent)}%)</p>
                </div>
              </div>

              {/* Water logging widget */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 animate-pulse">
                    <Droplet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-med-text' : 'text-white'}`}>Daily Hydration Goal</h4>
                    <p className={`text-[10px] ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Target: <b>{latestPlan.target_water_ml} ml</b></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-extrabold ${isLight ? 'text-med-text' : 'text-white'}`}>{waterCount * 250} ml / {latestPlan.target_water_ml} ml</span>
                  <button
                    onClick={() => setWaterCount(waterCount + 1)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold transition-all cursor-pointer"
                  >
                    + Drink 250ml
                  </button>
                </div>
              </div>

              {/* Recommended Meal Options */}
              <div className="space-y-4">
                <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isLight ? 'text-med-text' : 'text-white'}`}>
                  <Utensils className="h-4 w-4 text-primary animate-pulse" />
                  Today's Recommended Meals (Powered by ML Recommendation)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Breakfast */}
                  <div className={`p-4.5 rounded-2xl border space-y-3 relative overflow-hidden transition-all duration-300 ${
                    isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                  }`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
                    <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? 'text-med-text' : 'text-white'}`}>
                      <Coffee className="h-4 w-4 text-primary" />
                      Breakfast Recommendations
                    </div>
                    <div className="space-y-2">
                      {latestPlan.recommended_meals.breakfast?.map((food, idx) => (
                        <div key={idx} className={`flex justify-between items-center text-[10px] pb-1.5 border-b ${
                          isLight ? 'border-med-secondary' : 'border-white/[0.03]'
                        }`}>
                          <div>
                            <p className={`font-semibold ${isLight ? 'text-med-text' : 'text-gray-200'}`}>{food.food_name}</p>
                            <p className={`text-[8px] ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>{food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g</p>
                          </div>
                          <button
                            onClick={() => handleLogRecommendedFood(food, 'Breakfast')}
                            className={`p-1 rounded-md border text-[8px] font-bold cursor-pointer transition-colors ${
                              isLight 
                                ? 'bg-med-secondary border-med-primary/10 hover:bg-med-primary hover:text-white hover:border-transparent text-med-primary' 
                                : 'bg-white/[0.03] border border-white/10 hover:bg-primary/20 hover:border-primary/40 text-primary'
                            }`}
                          >
                            Log Item
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className={`p-4.5 rounded-2xl border space-y-3 relative overflow-hidden transition-all duration-300 ${
                    isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                  }`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
                    <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? 'text-med-text' : 'text-white'}`}>
                      <Sun className="h-4 w-4 text-amber-500" />
                      Lunch Recommendations
                    </div>
                    <div className="space-y-2">
                      {latestPlan.recommended_meals.lunch?.map((food, idx) => (
                        <div key={idx} className={`flex justify-between items-center text-[10px] pb-1.5 border-b ${
                          isLight ? 'border-med-secondary' : 'border-white/[0.03]'
                        }`}>
                          <div>
                            <p className={`font-semibold ${isLight ? 'text-med-text' : 'text-gray-200'}`}>{food.food_name}</p>
                            <p className={`text-[8px] ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>{food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g</p>
                          </div>
                          <button
                            onClick={() => handleLogRecommendedFood(food, 'Lunch')}
                            className={`p-1 rounded-md border text-[8px] font-bold cursor-pointer transition-colors ${
                              isLight 
                                ? 'bg-med-secondary border-med-primary/10 hover:bg-med-primary hover:text-white hover:border-transparent text-med-primary' 
                                : 'bg-white/[0.03] border border-white/10 hover:bg-primary/20 hover:border-primary/40 text-primary'
                            }`}
                          >
                            Log Item
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className={`p-4.5 rounded-2xl border space-y-3 relative overflow-hidden transition-all duration-300 ${
                    isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                  }`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
                    <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? 'text-med-text' : 'text-white'}`}>
                      <Moon className="h-4 w-4 text-indigo-400 animate-pulse" />
                      Dinner Recommendations
                    </div>
                    <div className="space-y-2">
                      {latestPlan.recommended_meals.dinner?.map((food, idx) => (
                        <div key={idx} className={`flex justify-between items-center text-[10px] pb-1.5 border-b ${
                          isLight ? 'border-med-secondary' : 'border-white/[0.03]'
                        }`}>
                          <div>
                            <p className={`font-semibold ${isLight ? 'text-med-text' : 'text-gray-200'}`}>{food.food_name}</p>
                            <p className={`text-[8px] ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>{food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g</p>
                          </div>
                          <button
                            onClick={() => handleLogRecommendedFood(food, 'Dinner')}
                            className={`p-1 rounded-md border text-[8px] font-bold cursor-pointer transition-colors ${
                              isLight 
                                ? 'bg-med-secondary border-med-primary/10 hover:bg-med-primary hover:text-white hover:border-transparent text-med-primary' 
                                : 'bg-white/[0.03] border border-white/10 hover:bg-primary/20 hover:border-primary/40 text-primary'
                            }`}
                          >
                            Log Item
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Snacks */}
                  <div className={`p-4.5 rounded-2xl border space-y-3 relative overflow-hidden transition-all duration-300 ${
                    isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                  }`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
                    <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? 'text-med-text' : 'text-white'}`}>
                      <Utensils className="h-4 w-4 text-emerald-450" />
                      Snacks Recommendations
                    </div>
                    <div className="space-y-2">
                      {latestPlan.recommended_meals.snacks?.map((food, idx) => (
                        <div key={idx} className={`flex justify-between items-center text-[10px] pb-1.5 border-b ${
                          isLight ? 'border-med-secondary' : 'border-white/[0.03]'
                        }`}>
                          <div>
                            <p className={`font-semibold ${isLight ? 'text-med-text' : 'text-gray-200'}`}>{food.food_name}</p>
                            <p className={`text-[8px] ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>{food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g</p>
                          </div>
                          <button
                            onClick={() => handleLogRecommendedFood(food, 'Snack')}
                            className={`p-1 rounded-md border text-[8px] font-bold cursor-pointer transition-colors ${
                              isLight 
                                ? 'bg-med-secondary border-med-primary/10 hover:bg-med-primary hover:text-white hover:border-transparent text-med-primary' 
                                : 'bg-white/[0.03] border border-white/10 hover:bg-primary/20 hover:border-primary/40 text-primary'
                            }`}
                          >
                            Log Item
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Data Visualization Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Macros Breakdown Chart */}
                <div className={`p-5 rounded-2xl border text-center space-y-2 flex flex-col items-center transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                }`}>
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider w-full text-left ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Macros Target Breakdown</h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ 
                          background: isLight ? '#FFFFFF' : '#0B1120', 
                          border: isLight ? '1px solid rgba(91, 76, 245, 0.1)' : '1px solid rgba(255,255,255,0.1)',
                          color: isLight ? '#1A1A1A' : '#F8FAFC'
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={`flex gap-4 text-[9px] ${isLight ? 'text-med-text' : 'text-gray-300'}`}>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block"/>Protein</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"/>Carbs</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block"/>Fats</span>
                  </div>
                </div>

                {/* Historical Weight Trend Chart */}
                <div className={`p-5 rounded-2xl border text-center space-y-2 transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
                }`}>
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider text-left ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Weight Log Trends</h4>
                  {bmiHistory.length > 0 ? (
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bmiHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'} />
                          <XAxis dataKey="recorded_at" tickFormatter={(str) => new Date(str).toLocaleDateString([], {month: 'short', day: 'numeric'})} stroke={isLight ? '#666666' : 'rgba(255,255,255,0.3)'} style={{ fontSize: 9 }} />
                          <YAxis stroke={isLight ? '#666666' : 'rgba(255,255,255,0.3)'} style={{ fontSize: 9 }} />
                          <Tooltip contentStyle={{ 
                            background: isLight ? '#FFFFFF' : '#0B1120', 
                            border: isLight ? '1px solid rgba(91, 76, 245, 0.1)' : '1px solid rgba(255,255,255,0.1)',
                            color: isLight ? '#1A1A1A' : '#F8FAFC'
                          }} />
                          <Line type="monotone" dataKey="weight_kg" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-[10px] text-gray-500">Weight logs will appear here.</div>
                  )}
                </div>

              </div>

              {/* Today's Logged Meals list */}
              <div className={`p-5 rounded-3xl border transition-all duration-300 ${
                isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Today's Logged Meals</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    isLight ? 'bg-med-secondary text-med-primary' : 'bg-primary/10 text-primary'
                  }`}>
                    {mealLogs.filter(log => new Date(log.log_date).toDateString() === new Date().toDateString()).length} Logged
                  </span>
                </div>
                {mealLogs.filter(log => new Date(log.log_date).toDateString() === new Date().toDateString()).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {mealLogs
                      .filter(log => new Date(log.log_date).toDateString() === new Date().toDateString())
                      .map((log) => (
                        <div key={log.id} className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all ${
                          isLight ? 'bg-med-secondary/35 border-med-primary/5 hover:bg-med-secondary/50' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                        }`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                log.meal_type === 'Breakfast' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                log.meal_type === 'Lunch' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                log.meal_type === 'Dinner' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                                'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              }`}>
                                {log.meal_type}
                              </span>
                              <p className={`text-xs font-bold ${isLight ? 'text-med-text' : 'text-gray-200'}`}>{log.food_name}</p>
                            </div>
                            <p className={`text-[9px] ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                              Calories: <b>{log.calories} kcal</b> | P: <b>{log.protein}g</b> | C: <b>{log.carbs}g</b> | F: <b>{log.fat}g</b>
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteMealLog(log.id)}
                            className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-gray-400 transition-colors cursor-pointer"
                            title="Delete meal log"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-[10px]">No meals logged for today. Try logging one!</div>
                )}
              </div>

            </motion.div>
          ) : (
            <div className={`p-10 rounded-3xl border flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[460px] shadow-lg transition-all duration-300 ${
              isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
            }`}>
              <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center shadow-inner ${
                isLight ? 'bg-med-secondary border-med-primary/10' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <Utensils className={`h-7 w-7 animate-pulse ${isLight ? 'text-med-primary' : 'text-gray-600'}`} />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className={`font-bold text-sm ${isLight ? 'text-med-text' : 'text-gray-300'}`}>Meal Recommendations Idle</p>
                <p className={`text-xs leading-normal ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>
                  Submit your age, weight, and goals parameters on the left to trigger the ML recommendation classifier, map calories, and display customized plans.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Log Meal Modal */}
      <AnimatePresence>
        {logModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative max-w-sm w-full border rounded-[28px] p-6 shadow-2xl overflow-hidden transition-all duration-300 ${
                isLight ? 'bg-white border-med-primary/15' : 'bg-[#151e30] border-white/10'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
              
              <button 
                onClick={() => setLogModalOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 cursor-pointer ${isLight ? 'text-med-gray' : 'text-gray-400'}`}
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className={`text-sm font-bold font-poppins mb-4 ${isLight ? 'text-med-text' : 'text-white'}`}>Log Daily Meal Consumed</h3>

              <form onSubmit={handleCustomLog} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className={`block text-[9px] font-bold uppercase ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Food Name</label>
                  <input
                    type="text"
                    required
                    value={logFoodName}
                    onChange={(e) => setLogFoodName(e.target.value)}
                    placeholder="e.g. Oatmeal with fruits"
                    className="glass-input w-full px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Meal Time</label>
                    <select
                      value={logMealType}
                      onChange={(e) => setLogMealType(e.target.value)}
                      className="glass-input w-full px-3 py-1.5 text-xs"
                    >
                      <option value="Breakfast" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Breakfast</option>
                      <option value="Lunch" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Lunch</option>
                      <option value="Dinner" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Dinner</option>
                      <option value="Snack" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Snack</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Calories (kcal)</label>
                    <input
                      type="number"
                      value={logCalories}
                      onChange={(e) => setLogCalories(e.target.value)}
                      className="glass-input w-full px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className={`block text-[8px] font-bold uppercase ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Protein (g)</label>
                    <input
                      type="number"
                      value={logProtein}
                      onChange={(e) => setLogProtein(e.target.value)}
                      className="glass-input w-full px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-[8px] font-bold uppercase ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Carbs (g)</label>
                    <input
                      type="number"
                      value={logCarbs}
                      onChange={(e) => setLogCarbs(e.target.value)}
                      className="glass-input w-full px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-[8px] font-bold uppercase ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Fat (g)</label>
                    <input
                      type="number"
                      value={logFat}
                      onChange={(e) => setLogFat(e.target.value)}
                      className="glass-input w-full px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={logLoading}
                    className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-poppins"
                  >
                    {logLoading ? 'Saving...' : 'Add to Logs'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DietPlanner;
