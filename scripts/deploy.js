import React, { useState, useEffect, useCallback } from 'react';

const useCachedFetch = () => {
  const cache = {};
  
  const fetchWithCache = useCallback(async (url) => {
    if (cache[url]) {
      return cache[url]; // Return cached response
    } else {
      const response = await fetch(url);
      const data = await response.json();
      cache[url] = data; // Cache new response
      return data;
    }
  }, []); // dependencies array is empty, meaning it will not re-create this method unless component is re-mounted
  
  return { fetchWith

Cache };
};

function MealPlanComponent() {
  const [meals, setMeals] = useState([]);
  const { fetchWithCache } = useCachedFetch();

  const getMeals = useCallback(async () => {
    const data = await fetchWithCache(process.env.REACT_APP_API_URL + '/meals');
    setMeals(data);
  }, [fetchWithCache]); // Re-runs only if fetchWithCache changes

  useEffect(() => {
    getMeals();
  }, [getMeals]);

  // The rest of your component...
}