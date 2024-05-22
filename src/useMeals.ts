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

    const fetchMealPlans = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mealplans`);
            setMealPlans(response.data);
        } catch (err: any) {
            setError(err.message || 'Unexpected error!');
        } finally {
            setIsLoading(false);
        }
    };

    const addMealPlan = async (newPlan: Omit<MealPlan, 'id'>) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/mealplans`, newPlan);
            setMealPlans([...mealPlans, response.data]);
        } catch (err: any) {
            setError(err.message || 'Failed to add meal plan.');
        }
    };

    const updateMealPlan = async (id: string, updatedPlan: Omit<MealPlan, 'id'>) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/mealplans/${id}`, updatedPlan);
            const newMealPlans = mealPlans.map(plan => plan.id === id ? {...plan, ...updatedPlan} : plan);
            setMealPlans(newMealPlans);
        } catch (err: any) {
            setError(err.message || 'Failed to update meal plan.');
        }
    };

    const deleteMealPlan = async (id: string) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/mealplans/${id}`);
            const newMealPlans = mealPlans.filter(plan => plan.id !== id);
            setMealPlans(newMealPlans);
        } catch (err: any) {
            setError(err.message || 'Failed to delete meal plan.');
        }
    };

    useEffect(() => {
        fetchMealPlans();
    }, []);

    return { mealPlans, isLoading, error, addMealPlan, updateMealPlan, deleteMealPlan };
};

export default useMealPlans;