const request = require('supertest');
const app = require('../app');
require('dotenv').config();
describe('Meal Management Functionalities', () => {
  it('should create a new meal', async () => {
    const res = await request(app)
      .post('/meals')
      .send({
        name: 'Grilled Chicken',
        calories: 500,
        date: new Date(),
      })
      .set('Authorization', `Bearer ${process.env.TEST_USER_TOKEN}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });
  it('should retrieve all meals', async () => {
    const res = await request(app)
      .get('/meals')
      .set('Authorization', `Bearer ${process.env.TEST_USER_TOKEN}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
  it('should update a meal', async () => {
    const mealId = 'someMealId';
    const res = await request(app)
      .put(`/meals/${mealId}`)
      .send({
        name: 'Updated Meal Name',
        calories: 600,
      })
      .set('Authorization', `Bearer ${process.env.TEST_USER_TOKEN}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', mealId);
  });
  it('should delete a meal', async () => {
    const mealId = 'someMealIdToDelete';
    const res = await request(app)
      .delete(`/meals/${mealId}`)
      .set('Authorization', `Bearer ${process.env.TEST_USERTOKEN}`);
    expect(res.statusCode).toEqual(204);
  });
  it('should not allow unauthorized access to manage meals', async () => {
    const res = await request(app)
      .get('/meals');
    expect(res.statusCode).toEqual(401);
  });
});