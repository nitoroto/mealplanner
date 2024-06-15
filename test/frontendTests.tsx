import React, { useState } from 'react';
import _ from 'lodash';

const MealPlanner = () => {
  const [nameOfMeal, setNameOfMeal] = useState('');
  const [listOfIngredients, setListOfIngredients] = useState('');
  const [dateForMeal, setDateForMeal] = useState('');

  const postMealPlan = (mealDetails) => {
    fetch(`${process.env.REACT_APP_API_URL}/saveMealPlan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mealDetails),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error saving meal plan:', error));
  };

  const delayedPostMealPlan = _.debounce(postMealPlan, 800);

  const handleSubmit = (e) => {
    e.preventDefault();
    delayedPostMealPlan({ nameOfMeal, listOfIngredients, dateForMeal });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="meal-planning-form">
      <label htmlFor="nameOfMeal">Meal Name</label>
      <input id="nameOfMeal" value={nameOfMeal} onChange={(e) => setNameOfMeal(e.target.value)} />

      <label htmlFor="listOfIngredients">Ingredients</label>
      <input id="listOfIngredients" value={listOfIngredients} onChange={(e) => setListOfIngredients(e.target.value)} />

      <label htmlFor="dateForMeal">Meal Date</label>
      <input type="date" id="dateForMeal" value={dateForMeal} onChange={(e) => setDateForMeal(e.target.value)} />

      <button type="submit">Save Meal Plan</button>
    </form>
  );
};

export default MealPlanner;