// routes/posts.js
const express = require('express');
const router = express.Router();
const { Post, User, Tag } = require('../models');

// Create Post
router.post('/', async (req, res) => {
    const post = await Post.create(req.body);
    res.json(post);
});

// Get All Posts with User and Tags
router.get('/', async (req, res) => {
    const posts = await Post.findAll({ include: [User, Tag] });
    res.json(posts);
});

// Get One Post by ID
router.get('/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id, { include: [User, Tag] });
    post ? res.json(post) : res.sendStatus(404);
});

// Update Post
router.put('/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.sendStatus(404);
    await post.update(req.body);
    res.json(post);
});

// Delete Post
router.delete('/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.sendStatus(404);
    await post.destroy();
    res.sendStatus(204);
});

// Attach Tags to Post (many-to-many)
router.post('/:id/tags', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.sendStatus(404);
    const tags = await Tag.findAll({ where: { id: req.body.tagIds } });
    await post.setTags(tags); // or .addTags()
    res.json({ message: 'Tags updated' });
});

module.exports = router;
