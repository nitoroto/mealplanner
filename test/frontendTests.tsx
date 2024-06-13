import React, { useState } from 'react';
import _ from 'lodash';

const MealPlanner = () => {
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [mealDate, setMealDate] = useState('');

  const saveMealPlan = (mealData) => {
    fetch(`${process.env.REACT_APP_API_URL}/saveMealPlan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mealData),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error saving meal plan:', error));
  };

  const debouncedSaveMealPlan = _.debounce(saveMealPlan, 800);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    debouncedSaveMealPlan({ mealName, ingredients, mealDate });
  };

  return (
    <form onSubmit={handleFormSubmit} data-testid="meal-planning-form">
      <label htmlFor="mealName">Meal Name</label>
      <input id="mealName" value={mealName} onChange={(e) => setMealName(e.target.value)} />

      <label htmlFor="ingredients">Ingredients</label>
      <input id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />

      <label htmlFor="mealDate">Meal Date</label>
      <input type="date" id="mealDate" value={mealDate} onChange={(e) => setMealDate(e.target.value)} />

      <button type="submit">Save Meal Plan</button>
    </form>
  );
};

export default MealPlanner;