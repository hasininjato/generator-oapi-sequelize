# **Sequelize2OpenAPI Documentation**

## 📘 Overview

**Sequelize2OpenAPI** automatically generates **OpenAPI (Swagger)** specifications for Express.js applications by analyzing annotations in Sequelize models. This approach ensures:

* API documentation stays in sync with your models
* Less manual effort for keeping docs up-to-date

---

## 📦 Installation

Install the package via npm:

```bash
npm install sequelize2openapi
```

---

## ⚙️ Configuration

Create a file named `sequelize2openapi.json` in your project root:

```json
{
  "openApiDefinition": {
    "openapi": "3.0.0",
    "info": {
      "title": "OpenAPI specs",
      "description": "OpenAPI specifications generator with Sequelize",
      "contact": {
        "name": "Hasininjato Rojovao"
      },
      "version": "1.0.0"
    },
    "servers": [
      { "url": "http://localhost:8000/api" },
      { "url": "http://localhost:3000/api" }
    ]
  },
  "servicesPath": "./app/docs/services",
  "modelsPath": "./app/models",
  "defaultSecurity": "jwt",
  "routePrefix": "/api"
}
```

### 🔧 Key Options

| Option              | Description                                     |
| ------------------- | ----------------------------------------------- |
| `openApiDefinition` | Base spec, extended with model definitions      |
| `servicesPath`      | Directory for generated service YAML files      |
| `modelsPath`        | Directory of Sequelize models                   |
| `defaultSecurity`   | Default security scheme (e.g., `"jwt"`)         |
| `routePrefix`       | Prefix used for all API routes (e.g., `"/api"`) |

---

## 🚀 Usage

### Basic Integration in Express

```js
const sequelize2openapi = require('sequelize2openapi');
const swaggerUi = require('swagger-ui-express');

try {
  const swaggerSpec = sequelize2openapi(app);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (err) {
  console.error(err);
}
```

### CLI Tool

Generate a default service file for a Sequelize model:

```bash
sequelize2openapi -m ModelName
```

---

## 🧩 Model Annotations

Add `@swag` annotations to Sequelize model fields:

```js
const Profile = sequelize.define('Profile', {
  /**
   * @swag
   * description: Profile ID
   * methods: list, item
   */
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  /**
   * @swag
   * description: Profile bio
   * methods: list, item, put, post
   */
  bio: DataTypes.TEXT
});
```

### Annotation Options

| Field         | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| `description` | Appears in API docs as the field description                     |
| `methods`     | Determines which CRUD or custom operations this field applies to |

---

## 📄 Generated Documentation

Based on your annotations, Sequelize2OpenAPI generates:

* Model schemas
* CRUD endpoints
* Query & request parameter documentation
* Success & error response examples

All documentation is served at the configured `/docs` path.

---

## 🧱 Service Files & Custom Operations

### Standard CRUD Example

```yaml
ModelName:
  collectionOperations:
    get:
      openapi_context:
        summary: "List items"
      output: [ "modelname:list" ]

    post:
      openapi_context:
        summary: "Create item"
      input: [ "modelname:post" ]
      output: [ "modelname:item" ]
      isCreation: true

  itemOperations:
    get:
      openapi_context:
        summary: "Get item by ID"
      output: [ "modelname:item" ]

    put:
      openapi_context:
        summary: "Update item"
      input: [ "modelname:put" ]
      output: [ "modelname:item" ]

    delete:
      openapi_context:
        summary: "Delete item"
```

### Custom Route Example

```yaml
login:
  tags: "Authentication"
  path: "/auth/login"
  method: "POST"
  openapi_context:
    summary: "Login"
    description: "Authenticate user"
    responses:
      401:
        description: "Invalid credentials"
  input: [ "user:login" ]
  output: [ "user:login" ]
```

### Key Features

* **Auto Responses**: Adds 200/201 success and default error responses
* **Custom Responses**: Override status descriptions
* **Input/Output Mapping**: Matches fields via `@swag` annotations

---

## 🧪 Complete Example

```yaml
# user.yaml
User:
  collectionOperations:
    get:
      openapi_context:
        summary: "List users"
        tags: ["User Management"]
      output: [ "user:list" ]

    post:
      openapi_context:
        summary: "Create user"
        tags: ["User Management"]
      input: [ "user:post" ]
      output: [ "user:item" ]
      isCreation: true

  itemOperations:
    get:
      openapi_context:
        summary: "Get user details"
        tags: ["User Management"]
      output: [ "user:item" ]

    put:
      openapi_context:
        summary: "Update user"
        tags: ["User Management"]
      input: [ "user:put" ]
      output: [ "user:item" ]

login:
  tags: "Authentication"
  path: "/auth/login"
  method: "POST"
  openapi_context:
    summary: "Login"
  input: [ "user:login" ]
  output: [ "user:login" ]
```

---

## 🔐 Annotating Custom Auth Fields

```js
const User = sequelize.define('User', {
  /**
   * @swag
   * description: Email for login
   * methods: login, post
   */
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  /**
   * @swag
   * description: Password for login
   * methods: login, post
   */
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  /**
   * @swag
   * description: Auth token
   * methods: login, refresh
   */
  token: DataTypes.STRING
});
```

---

## 🔁 Relationship Annotations

### One-to-One

No annotation needed:

```js
User.hasOne(Profile);
Profile.belongsTo(User);
```

### One-to-Many

Use `@swag` in association:

```js
Parent.hasMany(Child);
/**
 * @swag
 * relations:
 *   model: Child
 *   type: one-to-many
 */
Child.belongsTo(Parent);
```

---

## ✅ Best Practices

1. Keep model annotations aligned with your actual API logic
2. Tag operations meaningfully (`User Management`, `Auth`, etc.)
3. Use `isCreation: true` for POST routes that create new entities
4. Separate custom routes clearly in service files
5. Use the CLI tool when adding new models

---

## 📬 Support

For issues or feature requests, contact **Hasininjato Rojovao** or open an issue on the project's repository.

---

Would you like a Markdown version of this cleaned-up documentation?
