const request = require('supertest');
const app = require('../app');
require('dotenv').config();

describe('Meal Management Functionalities', () => {
  const token = `Bearer ${process.env.TEST_USER_TOKEN}`;

  const newMeal = {
    name: 'Grilled Chicken',
    calories: 500,
    date: new Date(),
  };

  const updatedMeal = {
    name: 'Updated Meal Name',
    calories: 600,
  };

  const mealIdToUpdate = 'someMealId';
  const mealIdToDelete = 'someMealIdToDelete';

  it('should create a new meal', async () => {
    const res = await request(app)
      .post('/meals')
      .send(newMeal)
      .set('Authorization', token);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should retrieve all meals', async () => {
    const res = await request(app)
      .get('/meals')
      .set('Authorization', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should update a meal', async () => {
    const res = await request(app)
      .put(`/meals/${mealIdToUpdate}`)
      .send(updatedMeal)
      .set('Authorization', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', meal: IdToUpdate);
  });

  it('should delete a meal', async () => {
    const res = await request(app)
      .delete(`/meals/${mealIdToDelete}`)
      .set('Authorization', token);

    expect(res.statusCode).toEqual(204);
  });

  it('should not allow unauthorized access to manage meals', async () => {
    const res = await request(app).get('/meals');

    expect(res.statusCode).toEqual(401);
  });
});