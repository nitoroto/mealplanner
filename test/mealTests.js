const request = require('supertest');
const app = require('../app');
require('dotenv').config();

describe('Meal Management Functionalities Tests', () => {
  const authToken = `Bearer ${process.env.TEST_USER_TOKEN}`;

  const mealToCreate = {
    name: 'Grilled Chicken',
    calories: 500,
    date: new Date(),
  };

  const mealToUpdateData = {
    name: 'Updated Meal Name',
    calories: 600,
  };

  const mealIdForUpdate = 'someMealIdToUpdate';
  const mealIdForDeletion = 'someMealIdToDelete';

  it('should create a new meal successfully', async () => {
    const response = await request(app)
      .post('/meals')
      .send(mealToCreate)
      .set('Authorization', authToken);

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should fetch all meals', async () => {
    const response = await request(app)
      .get('/meals')
      .set('Authorization', authToken);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should successfully update a meal', async () => {
    const response = await request(app)
      .put(`/meals/${mealIdForUpdate}`)
      .send(mealToUpdateData)
      .set('Authorization', authToken);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('id', mealIdForUpdate);
  });

  it('should delete a meal successfully', async () => {
    const response = await request(app)
      .delete(`/meals/${mealIdForDeletion}`)
      .set('Authorization', authToken);

    expect(response.statusCode).toEqual(204);
  });

  it('should restrict unauthorized access to meal management', async () => {
    const response = await request(app).get('/meals');

    expect(response.statusCode).toEqual(401);
  });

  it('should return an error for creating a meal without required fields', async () => {
    const response = await request(app)
      .post('/meals')
      .send({})
      .set('Authorization', authToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual('Missing required meal fields');
  });

  it('should return an error for updating a non-existing meal', async () => {
    const nonExistingMealId = 'nonExistingMealId';
    const response = await request(app)
      .put(`/meals/${nonExistingMealId}`)
      .send(mealToUpdateData)
      .set('Authorization', authToken);

    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual('Meal not found');
  });

  it('should return an error for deleting a non-existing meal', async () => {
    const nonExistingMealId = 'nonExistingMealIdForDeletion';
    const response = await request(app)
      .delete(`/meals/${nonExistingMealId}`)
      .set('Authorization', authToken);

    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual('Meal to delete not found');
  });
});