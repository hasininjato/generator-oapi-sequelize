// routes/tags.js
const express = require('express');
const router = express.Router();
const { Tag, Post } = require('../models');

// Create Tag
router.post('/', async (req, res) => {
    const tag = await Tag.create(req.body);
    res.json(tag);
});

// Get All Tags with Posts
router.get('/', async (req, res) => {
    const tags = await Tag.findAll({ include: Post });
    res.json(tags);
});

// Get One Tag by ID
router.get('/:id', async (req, res) => {
    const tag = await Tag.findByPk(req.params.id, { include: Post });
    tag ? res.json(tag) : res.sendStatus(404);
});

// Update Tag
router.put('/:id', async (req, res) => {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.sendStatus(404);
    await tag.update(req.body);
    res.json(tag);
});

// Delete Tag
router.delete('/:id', async (req, res) => {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.sendStatus(404);
    await tag.destroy();
    res.sendStatus(204);
});

module.exports = router;
