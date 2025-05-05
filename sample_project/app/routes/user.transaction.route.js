const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../services/user.service');
const { createTransaction, getUserTransactions } = require('../services/transaction.service');
const verifyToken = require('../middlewares/auth.middleware');
const Joi = require('joi');

/**
 * public routes, everyone can create an user (signup)
 */
// we begin with simple validation using joi
const userSchema = Joi.object({
    fullname: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().email().required()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UserGet:
 *       type: object
 *       required:
 *         - fullname
 *         - email
 *       properties:
 *         fullname:
 *           type: string
 *           description: Nom de l'utilisateur
 *         email:
 *           type: string
 *           description: Email de l'utilisateur
 *       example:
 *         fullname: Name
 *         email: email@test.com
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserCreationResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Id de l'utilisateur
 *         fullname:
 *           type: string
 *           description: Nom de l'utilisateur
 *         email:
 *           type: string
 *           description: Email de l'utilisateur
 *         access_token:
 *           type: string
 *           description: Access token généré
 *       example:
 *         email: email@test.com
 *         password: test
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         fullname:
 *           type: string
 *           description: Nom de l'utilisateur
 *         email:
 *           type: string
 *           description: Email de l'utilisateur
 *         password:
 *           type: string
 *           description: Mot de passe
 *       example:
 *         fullname: Nom de l'utilisateur
 *         email: email@test.com
 *         password: test
 */
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Créer un utilisateur
 *     tags: ['Utilisateur']
 *     description: Créer un utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: Création réussie
 *         contents:
 *           applciation/json:
 *             schema:
 *               $ref: '#components/schemas/UserCreationResponse'
 *       '400':
 *         description: Bad request
 *       '409':
 *         description: Unique constraint error
 *       '500':
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    try {
        const { fullname, email, password } = req.body;
        const newUser = await createUser({ fullname, email, password });
        res.status(201).json(newUser);
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ errors: error.errors });
        }

        if (error.name === "UniqueConstraintError") {
            return res.status(409).json({ errors: error.errors });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
});


router.get('/', verifyToken, async (req, res) => {
    // manual pagination for list of all users
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    try {
        const users = await getAllUsers({ limit, offset });
        res.json(users);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});


// routes for transaction
const transactionSchema = Joi.object({
    description: Joi.string().required(),
    amount: Joi.number().min(0).required()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *           description: Description de la transaction
 *         amount:
 *           type: string
 *           description: Montant de l transaction
 *       example:
 *         description: transaction 01
 *         amount: 20.5
 */
/**
 * @swagger
 * 
 * /users/{id}/transactions:
 *   post:
 *     summary: Créer une nouvelle transaction
 *     description: Créer une nouvelle transaction
 *     tags: ['Transaction']
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id de l'utilisateur
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Transactions
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.post('/:id/transactions', verifyToken, async (req, res) => {
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { id } = req.params;
    const { amount, description } = req.body;
    try {
        const newTransaction = await createTransaction(id, amount, description);
        res.status(201).json(newTransaction);
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ errors: error.errors });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
});


/**
 * @swagger
 * 
 * /users/{id}/transactions:
 *   get:
 *     summary: Récupérer les transactions d'un utilisateur
 *     description: Récupérer les transactions d'un utilisateur
 *     tags: ['Transaction']
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id de l'utilisateur
 *     responses:
 *       '200':
 *         description: Transactions
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.get('/:id/transactions', verifyToken, async (req, res) => {
    const { id } = req.params;
    // I put a 500 delay to clearly show the loader spinner when loading user's transactions
    setTimeout(async () => {
        try {
            const transactions = await getUserTransactions(id);
            res.status(200).json(transactions);
        } catch (error) {
            if (error.message.includes("User not found")) {
                return res.status(404).json({ message: "User not found" })
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }, 500);
});

router.get('/:id/transactions/:name', verifyToken, async (req, res) => {
    const { id } = req.params;
    // I put a 500 delay to clearly show the loader spinner when loading user's transactions
    setTimeout(async () => {
        try {
            const transactions = await getUserTransactions(id);
            res.status(200).json(transactions);
        } catch (error) {
            if (error.message.includes("User not found")) {
                return res.status(404).json({ message: "User not found" })
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }, 500);
});
// end routes for transaction

/**
 * @swagger
 * 
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son id
 *     description: Récupérer un utilisateur par son id
 *     tags: ['Utilisateur']
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id de l'utilisateur
 *     responses:
 *       '200':
 *         description: Utilisateur
 *         content:
 *           applciation/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#components/schemas/UserGet'
 *                 - type: object
 *                   properties:
 *                     Transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#components/schemas/Transaction'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await getUserById(id);
        res.json(user);
    } catch (error) {
        if (error.message.includes("User not found")) {
            return res.status(404).json({ message: error.message })
        }
        console.log(error)
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});


/**
 * @swagger
 * 
 * /users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     description: Mettre à jour un utilisateur
 *     tags: ['Utilisateur']
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id de l'utilisateur
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: Utilisateur
 *         contents:
 *           applciation/json:
 *             schema:
 *               $ref: '#components/schemas/User'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { fullname, email, password } = req.body;

    try {
        await updateUser(id, { fullname, email, password });
        res.status(204);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


/**
 * @swagger
 * 
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprimer un utilisateur
 *     tags: ['Utilisateur']
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id de l'utilisateur
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '204':
 *         description: No content
 *       '500':
 *         description: Internal server error
 */
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        await deleteUser(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
