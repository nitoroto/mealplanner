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

const MealItem = ({ meal, findMeal, onRemove }: { meal: IMeal; findMeal: (id: string) => void; onRemove?: () => void }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "meal",
    item: { id: meal.id },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<IDayPlan>();
      if (item && dropResult) {
        findMeal(item.id);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleDoubleClick = () => {
    const newName = prompt("Enter new meal name:", meal.name);
    const newCalories = prompt("Enter new calorie count:", meal.calories.toString());
    if (newName && newCalories) {
      findMeal(meal.id, newName, parseInt(newCalories));
    }
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span onDoubleClick={handleDoubleClick} style={{ cursor: 'pointer' }}>{meal.name} - {meal.calories} Cal</span>
      {onRemove && <button onClick={onRemove}>Remove</button>}
    </div>
  );
};

const MealDropZone = ({ day, meals, onDropMeal }: { day: string; meals: IMeal[]; onDropMeal: (itemId: string, day: string, name?: string, calories?: number) => void }) => {
  const [, drop] = useDrop(() => ({
    accept: "meal",
    drop: () => ({ day }),
  }));

  const handleRemove = (id: string) => {
    onDropMeal(id, day);
  };

  return (
    <div ref={drop} style={{ minHeight: '50px', margin: '10px', backgroundColor: 'lightgrey' }}>
      <div>{day}</div>
      {meals.map(meal => <MealItem key={meal.id} meal={meal} findMeal={(id, name?, calories?) => onDropMeal(id, day, name, calories)} onRemove={() => handleRemove(meal.id)}/>)}
    </div>
  );
};

const MealCalendar: React.FC = () => {
  const [weekPlan, setWeekPlan] = useState<IDayPlan[]>(initialWeekPlan);
  const [meals, setMeals] = useState<IMeal[]>([]);

  const addNewMeal = () => {
    const newMealName = prompt("Enter meal name:");
    if (!newMealName) return;
    const newMealCalories = parseInt(prompt("Enter meal calories:") || '0', 10);
    const newMeal: IMeal = { id: uuidv4(), name: newMealName, calories: newMealCalories || 0 };
    setMeals([...meals, newMeal]);
  };

  const moveMeal = (mealId: string, toDay: string, name?: string, calories?: number) => {
    // Update Meal if name or calories are provided
    if (name !== undefined && calories !== undefined) {
      setMeals(meals.map(meal => meal.id === mealId ? {...meal, name, calories} : meal));
    }

    const movingMeal = meals.find(meal => meal.id === mealId);
    if (!movingMeal) return;

    // To remove a meal from a day
    if (toDay === '') {
      setWeekPlan(weekPlan.map(dayPlan => ({
        ...dayPlan,
        meals: dayPlan.meals.filter(meal => meal.id !== mealId),
      })));
    } else {
      // Add or move the meal to the specified day
      setWeekPlan(weekPlan.map(dayPlan => {
        if (dayPlan.day === toDay) {
          return { ...dayPlan, meals: [...dayPlan.meals.filter(meal => meal.id !== mealId), movingMeal] };
        } else {
          return { ...dayPlan, meals: dayPlan.meals.filter(meal => meal.id !== mealId) };
        }
      }));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <button onClick={addNewMeal}>Add Global Meal</button>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        {weekPlan.map(dayPlan => (
          <MealDropZone key={dayPlan.day} day={dayPlan.day} meals={dayPlan.meals} onDropMeal={moveMeal} />
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