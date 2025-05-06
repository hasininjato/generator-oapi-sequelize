require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require("helmet")

// swagger documentation
const swaggerUi = require('swagger-ui-express')

// generator-oapi-sequelize
const sequelize2openapi = require("sequelize2openapi")

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

app.use('/api/users', require('./app/routes/user.transaction.route'));
app.use('/api/auth', require('./app/routes/auth.route'));
app.use('/api/profiles', require('./app/routes/profile.route'));
app.use('/api/tags', require('./app/routes/tag.route'));
app.use('/api/posts', require('./app/routes/post.route'));

try {
    const swaggerSpec = sequelize2openapi(app);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (err) {
    throw err;
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})