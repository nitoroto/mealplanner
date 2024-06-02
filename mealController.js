const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const mealSchema = new mongoose.Schema({
    userId: String,
    mealName: String, 
    calorieCount: Number, 
    consumptionDate: Date, 
});

const Meal = mongoose.model('Meal', mealSchema);

const app = express();
app.use(bodyParser.json());

app.post('/meals/bulk-upload', (req, res) => { 
    Meal.insertMany(req.body.meals)
        .then(result => res.status(201).json(result))
        .catch(error => res.status(400).json({ error }));
});

app.post('/meals/add', (req, res) => { 
    const newMeal = new Meal({
        userId: req.body.userId,
        mealName: req.body.mealName, 
        calorieCount: req.body.calorieCount, 
        consumptionDate: req.body.consumptionDate ? new Date(req.body.consumptionDate) : new Date(), 
    });

    newMeal.save()
        .then(meal => res.status(201).json(meal))
        .catch(error => res.status(400).json({ error }));
});

app.get('/meals/view', (req, res) => { 
    const userIdArray = req.query.userIds.split(','); 
    Meal.find({ userId: { $in: userIdArray } })
        .then(meals => res.json(meals))
        .catch(error => res.status(404).json({ error }));
});

app.put('/meals/update/:mealId', (req, res) => { 
    Meal.findByIdAndUpdate(
        req.params.mealId,
        req.body,
        { new: true }
    )
        .then(updatedMeal => res.json(updatedMeal)) 
        .catch(error => res.status(400).json({ error }));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});