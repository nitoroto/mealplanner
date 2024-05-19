require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

let users = [];
let meals = [];

// Simple in-memory cache
let mealsCache = null;
let cacheTimer = null;

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).send({ message: 'No token provided.' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        req.userId = decoded.id;
        next();
    });
};

app.post('/register', async (req, res) => {
    // Registration logic remains the same
});

app.post('/login', async (req, res) => {
    // Login logic remains the same
});

app.post('/meals', verifyToken, (req, res) => {
    try {
        const meal = {
            id: meals.length + 1,
            ...req.body,
        };

        meals.push(meal);

        // Invalidate cache
        mealsCache = null;

        res.status(201).send(meal);
    } catch (error) {
        res.status(500).send({ message: 'Failed to create a meal.' });
    }
});

app.get('/meals', verifyToken, (req, res) => {
    if (mealsCache) {
        return res.status(200).send(mealsCache);
    }

    setTimeout(() => {
        mealsCache = meals;
        if(cacheTimer) clearTimeout(cacheTimer);
        cacheTimer = setTimeout(() => mealsCache = null, 10000);

        res.status(200).send(mealsCache);
    }, 200);
});

app.get('/meals/:id', verifyToken, (req, res) => {
    // Individual meal retrieval logic remains the same
});

app.put('/meals/:id', verifyToken, (req, res) => {
    mealsCache = null;
});

app.delete('/meals/:id', verifyToken, (req, res) => {
    mealsCache = null;
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});