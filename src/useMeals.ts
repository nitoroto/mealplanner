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

  const fetchAndCacheMealPlans = async (retryAttempt = 0) => {
    setIsLoading(true);
    try {
      const cachedMealPlans = sessionStorage.getItem('mealPlans');
      if (cachedMealPlans) {
        setMealPlans(JSON.parse(cachedMealPlans));
      } else {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mealplans`);
        setMealPlans(response.data);
        sessionStorage.setItem('mealPlans', JSON.stringify(response.data));
      }
    } catch (error: any) {
      if (retryAttempt < 3) {
        fetchAndCacheMealPlans(retryAttempt + 1);
      } else {
        setError('Unable to fetch meal plans. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createMealPlan = async (mealPlanDetails: Omit<MealPlan, 'id'>) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/mealplans`, mealPlanDetails);
      setMealPlans([...mealPlans, response.data]);
      sessionStorage.removeItem('mealPlans'); // Invalidate Cache
    } catch (error: any) {
      setError('Failed to add meal plan.');
    }
  };

  const modifyMealPlan = async (mealPlanId: string, updatedDetails: Omit<MealPlan, 'id'>) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/mealplans/${mealPlanId}`, updatedDetails);
      const updatedMealPlans = mealPlans.map(plan => plan.id === mealPlanId ? {...plan, ...updatedDetails} : plan);
      setMealPlans(updatedMealPlans);
      sessionStorage.removeItem('mealPlans'); // Invalidate Cache
    } catch (error: any) {
      setError('Failed to update meal plan.');
    }
  };

  const removeMealPlan = async (mealPlanId: string) => {
    const previousMealPlans = [...mealPlans];
    const filteredMealPlans = mealPlans.filter(plan => plan.id !== mealPlanId);
    setMealPlans(filteredMealPlans); // Optimistic update
    sessionStorage.setItem('mealPlans', JSON.stringify(filteredMealPlans)); // Update cache optimistically
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/mealplans/${mealPlanId}`);
    } catch (error: any) {
      setMealPlans(previousMealPlans); // Revert if API call fails
      sessionStorage.setItem('mealPlans', JSON.stringify(previousMealPlans)); // Revert cache on failure
      setError('Failed to delete meal plan.');
    }
  };

  useEffect(() => {
    fetchAndCacheMealPlans();
  }, []);

  return { mealPlans, isLoading, error, addMealPlan: createMealPlan, updateMealPlan: modifyMealPlan, deleteMealPlan: removeMealPlan };
};

export default useMealPlans;