import { useEffect, useState } from 'react';
import axios from 'axios';

interface MealPlan {
  id: string;
  title: string;
  description: string;
}

const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlans = async (retryCount = 0) => {
    setIsLoading(true);
    try {
      const cachedMealPlans = sessionStorage.getItem('mealPlans');
      if(cachedMealPlans) {
        setMealPlans(JSON.parse(cachedMealPlans));
      } else {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mealplans`);
        setMealPlans(response.data);
        sessionStorage.setItem('mealPlans', JSON.stringify(response.data));
      }
    } catch (err: any) {
      if (retryCount < 3) {
        fetchMealPlans(retryCount + 1);
      } else {
        setError('Unable to fetch meal plans. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addMealPlan = async (newPlan: Omit<MealPlan, 'id'>) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/mealplans`, newPlan);
      setMealPlans([...mealPlans, response.data]);
      sessionStorage.removeItem('mealPlans'); // Invalidate Cache
    } catch (err: any) {
      setError('Failed to add meal plan.');
    }
  };

  const updateMealPlan = async (id: string, updatedPlan: Omit<MealPlan, 'id'>) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/mealplans/${id}`, updatedPlan);
      const newMealPlans = mealPlans.map(plan => plan.id === id ? {...plan, ...updatedPlan} : plan);
      setMealPlans(newMealPlans);
      sessionStorage.removeItem('mealPlans'); // Invalidate Cache
    } catch (err: any) {
      setError('Failed to update meal plan.');
    }
  };

  const deleteMealPlan = async (id: string) => {
    const prevMealPlans = [...mealPlans];
    const newMealPlans = mealPlans.filter(plan => plan.id !== id);
    setMealPlans(newMealPlans); // Optimistic update
    sessionStorage.setItem('mealPlans', JSON.stringify(newMealPlans)); // Update cache optimistically
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/mealplans/${id}`);
    } catch (err: any) {
      setMealPlans(prevMealPlans); // Revert if API call fails
      sessionStorage.setItem('mealPlans', JSON.stringify(prevMealPlans)); // Revert cache on failure
      setError('Failed to delete meal plan.');
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  return { mealPlans, isLoading, error, addMealPlan, updateMealPlan, deleteMealPlan };
};

export default useMealPlans;