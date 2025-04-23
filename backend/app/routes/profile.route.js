// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../models');

// Create User
router.post('/', async (req, res) => {
    const user = await db.User.create(req.body);
    res.json(user);
});

// Read All Users
router.get('/', async (req, res) => {
    const users = await db.User.findAll({ include: [Profile, Post] });
    res.json(users);
});

// Read One
router.get('/:id', async (req, res) => {
    const user = await db.User.findByPk(req.params.id, { include: [Profile, Post] });
    if (user) res.json(user);
    else res.status(404).send('User not found');
});

// Update
router.put('/:id', async (req, res) => {
    const user = await db.User.findByPk(req.params.id);
    if (user) {
        await user.update(req.body);
        res.json(user);
    } else res.status(404).send('User not found');
});

// Delete
router.delete('/:id', async (req, res) => {
    const user = await db.User.findByPk(req.params.id);
    if (user) {
        await user.destroy();
        res.sendStatus(204);
    } else res.status(404).send('User not found');
});

module.exports = router;
