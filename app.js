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
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ message: 'Username and password are required.' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const newUser = {
            id: users.length + 1,
            username,
            password: hashedPassword,
        };

        users.push(newUser);

        res.status(201).send({ message: 'User registered successfully!', userId: newUser.id });
    } catch (error) {
        res.status(500).send({ message: 'Error during registration.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(user => user.username === username);

        if (!user) {
            return res.status(404).send({ message: 'User not found!' });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ auth: false, token: null });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
            expiresIn: 86400, // 24 hours
        });

        res.status(200).send({ auth: true, token });
    } catch (error) {
        res.status(500).send({ message: 'Login failed.' });
    }
});

app.post('/meals', verifyToken, (req, res) => {
    try {
        const meal = {
            id: meals.length + 1,
            ...req.body,
        };

        meals.push(meal);
        res.status(201).send(meal);
    } catch (error) {
        res.status(500).send({ message: 'Failed to create a meal.' });
    }
});

app.get('/meals', verifyToken, (req, res) => {
    res.status(200).send(meals);
});

app.get('/meals/:id', verifyToken, (req, res) => {
    try {
        const meal = meals.find(m => m.id === parseInt(req.params.id));

        if (!meal) {
            return res.status(404).send({ message: 'Meal not found' });
        }

        res.status(200).send(meal);
    } catch (error) {
        res.status(500).send({ message: 'Failed to retrieve the meal.' });
    }
});

app.put('/meals/:id', verifyToken, (req, res) => {
    try {
        let meal = meals.find(m => m.id === parseInt(req.params.id));

        if (!meal) {
            return res.status(404).send({ message: 'Meal not found' });
        }

        Object.assign(meal, req.body);

        res.status(200).send(meal);
    } catch (error) {
        res.status(500).send({ message: 'Failed to update the meal.' });
    }
});

app.delete('/meals/:id', verifyToken, (req, res) => {
    try {
        const index = meals.findIndex(m => m.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).send({ message: 'Meal not found' });
        }

        meals.splice(index, 1);

        res.status(204).send();
    } catch (error) {
        res.status(500).send({ message: 'Failed to delete the meal.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});