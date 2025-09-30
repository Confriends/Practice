import React, { useState, useEffect } from "react";

// Nutrient type
type Nutrients = {
  calories: number;
  fiber: number;
  solubleFiber: number;
  insolubleFiber: number;
  protein: number;
  carbs: number;
};

type FoodEntry = {
  id: string;
  date: string;
  food: string;
  quantity: number;
  nutrients: Nutrients;
};

const initialGoals: Nutrients = {
  calories: 2000,
  fiber: 30,
  solubleFiber: 10,
  insolubleFiber: 10,
  protein: 100,
  carbs: 250,
};

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().substring(0, 10);
}

const LOCAL_KEY = "nutrition-tracker-entries";

const USDA_API_KEY = process.env.REACT_APP_USDA_API_KEY;

async function fetchNutrients(foodQuery: string, quantity: number): Promise<Nutrients | null> {
  try {
    // 1. Search for food
    const searchResp = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
        foodQuery
      )}&api_key=${USDA_API_KEY}`
    );
    const searchData = await searchResp.json();
    if (!searchData.foods || searchData.foods.length === 0) return null;
    const fdcId = searchData.foods[0].fdcId;

    // 2. Get food details
    const detailResp = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`
    );
    const detailData = await detailResp.json();

    // 3. Extract nutrients
    let calories = 0,
      fiber = 0,
      solubleFiber = 0,
      insolubleFiber = 0,
      protein = 0,
      carbs = 0;

    for (const n of detailData.foodNutrients) {
      if (n.nutrientName.includes("Protein")) protein = n.value * quantity;
      if (n.nutrientName.includes("Energy")) calories = n.value * quantity;
      if (n.nutrientName === "Carbohydrate, by difference") carbs = n.value * quantity;
      if (n.nutrientName === "Fiber, total dietary") fiber = n.value * quantity;
      if (n.nutrientName === "Fiber, soluble") solubleFiber = n.value * quantity;
      if (n.nutrientName === "Fiber, insoluble") insolubleFiber = n.value * quantity;
    }
    return { calories, fiber, solubleFiber, insolubleFiber, protein, carbs };
  } catch (error) {
    alert("Error fetching nutrition info");
    return null;
  }
}

function NutritionTracker() {
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [goals, setGoals] = useState<Nutrients>(initialGoals);
  const [loading, setLoading] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
  }, [entries]);

  async function addEntry() {
    if (!food || quantity <= 0) return;
    setLoading(true);
    const nutrients = await fetchNutrients(food, quantity);
    setLoading(false);
    if (!nutrients) {
      alert("Could not fetch nutrition info for this food.");
      return;
    }
    setEntries([
      ...entries,
      {
        id: Math.random().toString(36).slice(2),
        date: new Date().toISOString().substring(0, 10),
        food,
        quantity,
        nutrients,
      },
    ]);
    setFood("");
    setQuantity(1);
  }

  const weekStart = getWeekStart(new Date());
  const weeklyEntries = entries.filter((e) => getWeekStart(new Date(e.date)) === weekStart);
  const totals = weeklyEntries.reduce(
    (acc, e) => {
      Object.keys(acc).forEach((k) => {
        // @ts-ignore
        acc[k] += e.nutrients[k];
      });
      return acc;
    },
    { calories: 0, fiber: 0, solubleFiber: 0, insolubleFiber: 0, protein: 0, carbs: 0 }
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Nutrition Tracker</h1>
      <div>
        <input
          type="text"
          placeholder="Food (e.g., Apple)"
          value={food}
          onChange={(e) => setFood(e.target.value)}
        />
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ width: 60, marginLeft: 8 }}
        />
        <button onClick={addEntry} disabled={loading} style={{ marginLeft: 8 }}>
          {loading ? "Loading..." : "Add"}
        </button>
      </div>
      <h2>This Week's Intake</h2>
      <table border={1} cellPadding={6} style={{ width: "100%", marginBottom: 20 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Food</th>
            <th>Qty</th>
            <th>Calories</th>
            <th>Fiber</th>
            <th>Sol. Fiber</th>
            <th>Insol. Fiber</th>
            <th>Protein</th>
            <th>Carbs</th>
          </tr>
        </thead>
        <tbody>
          {weeklyEntries.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.food}</td>
              <td>{e.quantity}</td>
              <td>{e.nutrients.calories}</td>
              <td>{e.nutrients.fiber}</td>
              <td>{e.nutrients.solubleFiber}</td>
              <td>{e.nutrients.insolubleFiber}</td>
              <td>{e.nutrients.protein}</td>
              <td>{e.nutrients.carbs}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Weekly Totals</h2>
      <ul>
        {Object.entries(goals).map(([nutrient, goal]) => (
          <li key={nutrient}>
            {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}: {totals[nutrient as keyof Nutrients] || 0} / {goal} (
            {Math.round(
              ((totals[nutrient as keyof Nutrients] || 0) / (goal || 1)) * 100
            )}
            %)
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 32 }}>
        <h3>Set Your Goals</h3>
        {/* Implement input fields for each nutrient here */}
        <h3>Charts (Coming Soon)</h3>
        {/* Use a library like recharts or chart.js */}
      </div>
    </div>
  );
}

export default NutritionTracker;