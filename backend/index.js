require('dotenv').config();
const fs = require('fs');
const express = require('express');
const sequelize = require('./app/config/db.conf');
const cors = require('cors');
const helmet = require("helmet")

// swagger documentation
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

// models
const User = require('./app/models/user.model');
const Transaction = require('./app/models/transaction.model');

const swagglizeConfig = require('./swaggerDoc')

const app = express()

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use(helmet());

const port = 8000

// swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Swaggelize API',
            description: 'API automatic generator using Swagger API and Swaggelize',
            contact: {
                name: 'Hasininjato Rojovao'
            },
            version: "1.0.0"
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                basicAuth: {
                    type: 'http',
                    scheme: 'basic',
                }
            },
        },
        servers: [
            {
                url: "http://localhost:8000/api"
            }
        ],
    },
    apis: ['./app/routes/*.js']
}

const syncDb = async () => {
    try {
        await sequelize.sync({ force: false }); // set to false if no need to recreate tables and all existing data
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

// syncDb()

app.use('/api/users', require('./app/routes/user.transaction.route'));
app.use('/api/auth', require('./app/routes/auth.route'));
app.use('/api/profiles', require('./app/routes/profile.route'));
app.use('/api/tags', require('./app/routes/tag.route'));
app.use('/api/posts', require('./app/routes/post.route'));

const swaggerSpec = swaggerJsDoc(swaggerOptions);
// fs.writeFileSync("swagger.json", JSON.stringify(swaggerSpec, null, 4));

swagglizeConfig(app)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})