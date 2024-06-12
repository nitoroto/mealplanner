import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MealPlanner from './MealPlanner';

process.env.REACT_APP_API_URL = 'http://test-api-url.com';

describe('MealPlanner Component Tests', () => {
  function renderMealPlanner() {
    return render(<MealPlanner />);
  }

  async function fillAndSubmitForm({ mealName = '', ingredients = '', mealDate = '' }) {
    const utils = renderMealPlanner();
    const { getByLabelText, getByTestId } = utils;

    if (mealName) {
      fireEvent.change(getByLabelText(/Meal Name/i), { target: { value: mealName } });
    }
    if (ingredients) {
      fireEvent.change(getByLabelText(/Ingredients/i), { target: { value: ingredients } });
    }
    if (mealDate) {
      fireEvent.change(getByLabelText(/Meal Date/i), { target: { value: mealDate } });
    }

    fireEvent.submit(getByTestId('meal-planning-form'));

    return utils;
  }

  it('should display the meal planning form', () => {
    const { getByTestId } = renderMealPlanner();

    expect(getByTestId('meal-planning-form')).toBeInTheDocument();
  });

  it('should allow users to enter meal details', async () => {
    const { getByTestId } = await fillAndSubmitForm({
      mealName: 'Test Meal',
      ingredients: 'Test Ingredient 1, Test Ingredient 2',
    });

    await waitFor(() => {
      expect(getByTestId('meal-details')).toHaveTextContent('Test Meal');
      expect(getByTestId('meal-ingredients')).toHaveTextContent('Test Ingredient 1, Test Ingredient 2');
    });
  });

  it('should validate the meal name field before submitting the form', async () => {
    const { queryByText } = await fillAndSubmitForm({});

    await waitFor(() => {
      expect(queryByText(/Please enter a meal name/i)).toBeInTheDocument();
    });
  });

  it('should allow users to select a date for the meal', async () => {
    const { getByLabelText } = await fillAndSubmitForm({
      mealDate: '2023-05-10',
    });

    expect(getByLabelText(/Meal Date/i)).toHaveValue('2023-05-10');
  });

});