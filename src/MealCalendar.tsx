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

const MealItem = ({ meal, findMeal }: { meal: IMeal; findMeal: (id: string) => void }) => {
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

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {meal.name} - {meal.calories} Cal
    </div>
  );
};

const MealDropZone = ({ day, meals, onDropMeal }: { day: string; meals: IMeal[]; onDropMeal: (itemId: string, day: string) => void }) => {
  const [, drop] = useDrop(() => ({
    accept: "meal",
    drop: () => ({ day }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} style={{ minHeight: '50px', margin: '10px', backgroundColor: 'lightgrey' }}>
      <div>{day}</div>
      {meals.map(meal => <MealItem key={meal.id} meal={meal} findMeal={(id) => onDropMeal(id, day)}/>)}
    </div>
  );
};

const MealCalendar: React.FC = () => {
  const [weekPlan, setWeekPlan] = useState<IDayPlan[]>(initialWeekPlan);
  const [meals, setMeals] = useState<IMeal[]>([]);

  const addNewMeal = (day: string) => {
    const newMeal: IMeal = { id: uuidv4(), name: `Meal ${meals.length + 1}`, calories: Math.round(Math.random() * 500) };
    setMeals([...meals, newMeal]);
  };

  const moveMeal = (mealId: string, toDay: string) => {
    const movingMeal = meals.find(meal => meal.id === mealId);
    if (!movingMeal) return;

    setWeekPlan(weekPlan.map(dayPlan => {
      if (dayPlan.day === toDay) {
        return { ...dayPlan, meals: [...dayPlan.meals, movingMeal] };
      } else {
        return { ...dayPlan, meals: dayPlan.meals.filter(meal => meal.id !== mealId) };
      }
    }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <button onClick={() => addNewMeal('Monday')}>Add Meal</button>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        {weekPlan.map(dayPlan => (
          <MealDropZone key={dayPlan.day} day={dayPlan.day} meals={dayPlan.meals} onDropMeal={moveMeal} />
        ))}
      </div>
    </DndProvider>
  );
};

export default MealCalendar;