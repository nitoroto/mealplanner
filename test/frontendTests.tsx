import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MealPlanner from './MealPlanner';

process.env.REACT_APP_API_URL = 'http://test-api-url.com';

describe('MealPlanner Component Tests', () => {
  it('should display the meal planning form', () => {
    const { getByTestId } = render(<MealPlanner />);

    expect(getByTestId('meal-planning-form')).toBeInTheDocument();
  });

  it('should allow users to enter meal details', async () => {
    const { getByLabelText, getByTestId } = render(<MealPlanner />);

    fireEvent.change(getByLabelText(/Meal Name/i), { target: { value: 'Test Meal' } });
    fireEvent.change(getByLabelText(/Ingredients/i), { target: { value: 'Test Ingredient 1, Test Ingredient 2' } });

    fireEvent.submit(getByTestId('meal-planning-form'));

    await waitFor(() => {
      expect(getByTestId('meal-details')).toHaveTextContent('Test Meal');
      expect(getByTestId('meal-ingredients')).toHaveTextContent('Test Ingredient 1, Test Ingredient 2');
    });
  });

  it('should validate the meal name field before submitting the form', async () => {
    const { getByLabelText, getByTestId, queryByText } = render(<MealPlanner />);

    fireEvent.submit(getByTestId('meal-planning-form'));

    await waitFor(() => {
      expect(queryByText(/Please enter a meal name/i)).toBeInTheDocument();
    });
  });

  it('should allow users to select a date for the meal', () => {
    const { getByLabelText } = render(<MealPlanner />);

    fireEvent.change(getByLabelText(/Meal Date/i), { target: { value: '2023-05-10' } });

    expect(getByLabelText(/Meal Date/i)).toHaveValue('2023-05-10');
  });

});