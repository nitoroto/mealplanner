import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MealPlanComponent from './MealPlanComponent';

process.env.REACT_APP_API_URL = 'http://localhost:3000';

describe('MealPlanComponent Tests', () => {
  test('renders MealPlanComponent successfully', () => {
    render(<MealPlanComponent />);
    expect(screen.getByTestId('meal-plan-container')).toBeInTheDocument();
  });
  test('allows user to add a meal to the plan', async () => {
    render(<MealPlanComponent />);
    
    fireEvent.change(screen.getByTestId('meal-input'), { target: { value: 'Chicken Salad' } });
    fireEvent.click(screen.getByTestId('add-meal-button'));
    
    await waitFor(() => expect(screen.getByText('Chicken Salad')).toBeInTheDocument());
  });
  test('updates state correctly when a meal is added', async () => {
    const { getByTestId } = render(<MealPlanComponent />);
    
    fireEvent.change(getByTestId('meal-input'), { target: { value: 'Grilled Salmon' } });
    fireEvent.click(getByTestId('add-meal-button'));
    
    await waitFor(() => expect(getByTestId('meal-input')).toHaveValue(''));
  });
  test('shows error message when adding a meal fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.reject('Failed to fetch'),
      }),
    );

    render(<MealPlanComponent />);
    
    fireEvent.change(screen.getByTestId('meal-input'), { target: { value: 'Impossible Burger' } });
    fireEvent.click(screen.getByTestId('add-meal-button'));
    
    await waitFor(() => expect(screen.getByTestId('meal-plan-error')).toBeInTheDocument());
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
});