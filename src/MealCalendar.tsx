import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

interface IMeal {
  id: string;
  name: string;
  calories: number;
}

interface IDayPlan {
  day: string;
  meals: IMeal[];
}

const initialWeekPlan: IDayPlan[] = [
  { day: 'Monday', meals: [] },
  { day: 'Tuesday', meals: [] },
  { day: 'Wednesday', meals: [] },
  { day: 'Thursday', meals: [] },
  { day: 'Friday', meals: [] },
  { day: 'Saturday', meals: [] },
  { day: 'Sunday', meals: [] },
];

const MealItem = ({ meal, findMeal, onRemove }: { meal: IMeal; findMeal: (id: string, name?: string, calories?: number) => void; onRemove?: () => void }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "meal",
    item: { id: meal.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleDoubleClick = () => {
    let newName = prompt("Enter new meal name:", meal.name);
    let newCalories = prompt("Enter new calorie count:", meal.calories.toString());
    if (newName && newCalories) {
      // Simple validation for calories input
      const caloriesNumber = parseInt(newCalories, 10);
      if (isNaN(caloriesNumber)) {
        alert("Calories must be a number.");
        return;
      }
      findMeal(meal.id, newName, caloriesNumber);
    } else if (newName || newCalories) {
      alert("Both meal name and calorie count need to be provided.");
    }
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span onDoubleClick={handleDoubleClick} style={{ cursor: 'pointer' }}>{meal.name} - {meal.calories} Cal</span>
      {onRemove && <button onClick={onRemove}>Remove</button>}
    </div>
  );
};

const MealDropZone = ({ day, meals, onDropMeal, onClearMeals }: { day: string; meals: IMeal[]; onDropMeal: (itemId: string, day: string, name?: string, calories?: number) => void; onClearMeals?: () => void }) => {
  const [, drop] = useDrop(() => ({
    accept: "meal",
    drop: () => ({ day }),
  }));

  return (
    <div ref={drop} style={{ minHeight: '50px', padding: '10px', backgroundColor: 'lightgrey', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>{day}</strong>
        {onClearMeals && <button onClick={onClearMeals}>Clear Day</button>}
      </div>
      {meals.map(meal => <MealItem key={meal.id} meal={meal} findMeal={(id, name?, calories?) => onDropMeal(id, day, name, calories)} onRemove={() => onDropMeal(meal.id, day)}/>)}
    </div>
  );
};

const MealCalendar: React.FC = () => {
  const [weekPlan, setWeekPlan] = useState<IDayPlan[]>(initialWeekPlan);
  const [meals, setMeals] = useState<IMeal[]>([]);

  const addNewMeal = () => {
    let newMealName = prompt("Enter meal name:");
    let newMealCalories = prompt("Enter meal calories:");
    if (!newMealName || !newMealCalories) {
      alert("Meal name and calories must be provided.");
      return;
    }
    const caloriesNumber = parseInt(newMealCalories, 10);
    if (isNaN(caloriesNumber)) {
      alert("Calories must be a number.");
      return;
    }
    const newMeal: IMeal = { id: uuidv4(), name: newMealName, calories: caloriesNumber };
    setMeals([...meals, newMeal]);
  };

  const moveMeal = (mealId: string, toDay: string, name?: string, calories?: number) => {
    // Handle updates with provided name and/or calories
    const updatedMeals = meals.map((meal) => (meal.id === mealId && (name !== undefined || calories !== undefined)) ? { ...meal, name: name ?? meal.name, calories: calories ?? meal.calories } : meal);
    setMeals(updatedMeals);
    
    const updatedWeekPlan = weekPlan.map((dayPlan) => {
      if (dayPlan.day === toDay) {
        const filteredMeals = (toDay ? dayPlan.meals.filter((meal) => meal.id !== mealId) : dayPlan.meals);
        const movingMeal = updatedMeals.find((meal) => meal.id === mealId);
        if (movingMeal) {
          return { ...dayPlan, meals: [...filteredMeals, movingMeal] };
        }
      } else if (!toDay) {
        // Handle removal from all days if toDay is empty string
        const filteredMeals = dayPlan.meals.filter((meal) => meal.id !== mealId);
        return { ...dayPlan, meals: filteredMeals };
      }
      return dayPlan;
    });

    setWeekPlan(updatedWeekPlan);
  };

  const clearMealsForDay = (day: string) => {
    const updatedWeekPlan = weekPlan.map(dayPlan => dayPlan.day === day ? { ...dayPlan, meals: [] } : dayPlan);
    setWeekPlan(updatedWeekPlan);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <button onClick={addNewMeal}>Add Global Meal</button>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        {weekPlan.map(dayPlan => (
          <MealDropZone key={dayPlan.day} day={dayPlan.day} meals={dayPlan.meals} onDropMeal={moveMeal} onClearMeals={() => clearMealsForDay(dayPlan.day)} />
        ))}
      </div>
      <div style={{ margin: '10px', backgroundColor: 'oldlace' }}>
        <h3>Global Meals</h3>
        {meals.map(meal => <MealItem key={meal.id} meal={meal} findMeal={() => moveMeal(meal.id, '')} />)}
      </div>
    </DndProvider>
  );
};

export default MealCalendar;