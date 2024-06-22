import React, { useState, useEffect, useCallback } from 'react';

const useCachedFetch = () => {
  let cache = sessionStorage.getItem('apiCache') ? JSON.parse(sessionStorage.getItem('apiCache')) : {};
  
  const fetchWithCache = useCallback(async (url) => {
    if (cache[url]) {
      console.log('Returning cached data for', url);
      return cache[url]; // Return cached response
    } else {
      const response = await fetch(url);
      const data = await response.json();
      cache[url] = data; // Cache new response
      // Update sessionStorage with the latest cache
      sessionStorage.setItem('apiCache', JSON.stringify(cache));
      return data;
    }
  }, []); // dependencies array is empty, meaning it will not re-create this method unless component is re-mounted
  
  return { fetchWithCache };
};

function MealPlanComponent() {
  const [meals, setMeals] = useState([]);
  const { fetchWithCache } = useCachedFetch();

  const getMeals = useCallback(async () => {
    try {
      const data = await fetchWithCache(process.env.REACT_APP_API_URL + '/meals');
      setMeals(data);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      // Handle errors or show a message to the user
    }
  }, [fetchWithCache]); // Re-runs only if fetchWithCache changes

  useEffect(() => {
    getMeals();
  }, [getMeals]);

  // Enhance the component by allowing users to refresh the meal list manually
  const refreshMeals = () => {
    // Clear specific cache entry
    sessionStorage.removeItem('apiCache');
    getMeals(); // Refetch meals
  }

  return (
    <div>
      <h1>Meal Planner</h1>
      <button onClick={refreshMeals}>Refresh Meals</button>
      <ul>
        {meals.map(meal => (
          <li key={meal.id}>{meal.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default MealPlanComponent;