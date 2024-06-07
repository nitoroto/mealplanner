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
});