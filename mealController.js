const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connection established"))
  .catch(error => console.error("MongoDB connection error:", error));

const mealSchema = new mongoose.Schema({
    userId: String,
    mealName: String,
    calorieCount: Number,
    consumptionDate: Date,
});

const Meal = mongoose.model('Meal', mealSchema);

const app = express();
app.use(bodyParser.json());

function errorHandler(res, error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "An unexpected error occurred", type: error.name });
}

app.post('/meals/bulk-upload', (req, res) => {
    Meal.insertMany(req.body.meals)
        .then(result => res.status(201).json(result))
        .catch(error => errorHandler(res, error));
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
        .catch(error => errorHandler(res, error));
});

app.get('/meals/view', (req, res) => {
    if (!req.query.userIds) {
        return res.status(400).json({ error: "Missing userIds query parameter" });
    }
    const userIdArray = req.query.userIds.split(',');
    Meal.find({ userId: { $in: userIdArray } })
        .then(meals => res.json(meals))
        .catch(error => errorHandler(res, error));
});

app.put('/meals/update/:mealId', (req, res) => {
    Meal.findByIdAndUpdate(
        req.params.mealId,
        req.body,
        { new: true }
    )
        .then(updatedMeal => {
            if (!updatedMeal) {
                return res.status(404).json({ error: "Meal not found" });
            }
            res.json(updatedMeal);
        })
        .catch(error => errorHandler(res, error));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});