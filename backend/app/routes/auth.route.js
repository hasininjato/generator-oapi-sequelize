/**
 * routes for authentication (login, no backend process for logout, we only delete localstorage in front),
 * signup is the same as POST /users
 */
require('dotenv').config();
const express = require('express');
const router = express.Router();
const { getUserByEmail } = require('../services/user.service');
const bcrypt = require('bcrypt');
var jwt = require("jsonwebtoken");
const Joi = require('joi');

// we begin with simple validation
const userSchema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().email().required()
});
/**
 * @swagger
 * components:
 *   schemas:
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: Email de l'utilisateur
 *         password:
 *           type: string
 *           description: Mot de passe de l'utilisateur
 *       example:
 *         email: email@test.com
 *         password: test
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserLoginResponse:
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
 * /auth/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     description: Authentifier un utilisateur
 *     tags: ['Authentification']
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       '200':
 *         description: Login réussi
 *         contents:
 *           applciation/json:
 *             schema:
 *               $ref: '#components/schemas/UserLoginResponse'
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { email, password } = req.body;
    try {
        const user = await getUserByEmail(email);
        // if user is found, validate password
        var isPasswordValid = bcrypt.compareSync(
            password,
            user.password
        );
        if (!isPasswordValid) {
            // invalid credentials
            return res.status(401).send({
                accessToken: null,
                message: "Invalid credentials"
            });
        }
        // generate jwt token
        const accessToken = jwt.sign({ id: user.id },
            process.env.JWT_SECRET,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: 60 * 60, //TODO: to change to 15 but this is for testing purpose only
            }
        );
        res.status(200).send({
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            access_token: accessToken
        });
    } catch (error) {
        if (error.message == "User not found") {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// this route should be protected by JWT refresh token, but for now public for all to validate a jwt token
router.get('/validate-token', async (req, res) => {
    const accessToken = req.query.accessToken;
    jwt.verify(accessToken,
        process.env.JWT_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized",
                });
            }
            req.userId = decoded.id;
            res.status(200).send({
                message: "Token valid"
            })
        });
})

module.exports = router;