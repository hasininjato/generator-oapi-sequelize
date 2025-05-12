# Sequelize2OpenAPI

**Sequelize2OpenAPI** is a tool that automatically generates OpenAPI specifications (formerly Swagger) for Express.js API applications by analyzing annotations directly written in Sequelize models. This allows developers to maintain API documentation alongside their data models, ensuring consistency and reducing documentation overhead.

# Install

This package is still under development and not yet published on npmjs. But it can be installed with the command `npm install sequelize2openapi`.

# Usage

## Configuration

First, create a configuration file *sequelize2openapi.json* with this content:

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
            {
                "url": "http://localhost:8000/api"
            },
            {
                "url": "http://localhost:3000/api"
            }
        ]
    },
    "servicesPath": "./app/docs/services",
    "modelsPath": "./app/models",
    "defaultSecurity": "jwt",
    "routePrefix": "/api"
}
```

### Options

- `openApiDefinition`: Definitions of the OpenAPI specification for the project
    - `openApi`: Version of the specification
    - `info`: Information about the project
        - `title`: Title of your project
        - `description`: Description of your project
        - `contact`: Contact information of the creator of the project
            - `name`: Name of the creator of the project
            - `email`: His/Her email address
        - `version`: Version of your project
    - `servers`: Array of server URLs where the API is hosted
- `servicesPath`: Path to your service files
- `modelsPath`: Path to your Sequelize models files
- `defaultSecurity`: Security to be used (this is still ongoing)
- `routePrefix`: Prefix for all API routes (e.g., "/api")

## In main JS file

In your main JS file, this is how you use the package:

```javascript
const app = express()
const sequelize2openapi = require('sequelize2openapi');
const swaggerSpec = sequelize2openapi(app);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## In models

### Simple usage

In your Sequelize model, declare your model and annotate your fields with the `@swag` comment like this:

```javascript
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
     * example: Biography of the user
     * methods: list, item, put, post
     */
    bio: DataTypes.TEXT
});
```

#### Options

- `description`: Descriptioin of your field
- `example`: Example value
- `methods`: To group fields to be used later on request payload or responses.
    - Typically corresponds to CRUD operations (get [divided into `list` and `item`], post,put) or custom methods
    - Other possible values depend on your API implementation

### Usage with relationships

There are three different associations type in Sequelize and you have to annotate your association accordingly:

- One-to-one association: you don't need to specify nothing on this type of association

```javascript
User.hasOne(Profile);
Profile.belongsTo(User);
```

- One-to-many association: let's say you have two models User and Transaction, and one user has many transactions and a transaction is attached to only one user. For this association, you have to annotate your source model (here the User model) with the keyword `relations` which will hold the values of the associations:

```javascript
/**
 * @swag
 * relations: Transactions
 */
User.hasMany(Transaction, {
    foreignKey: {
        name: 'userId',
    }
});
Transaction.belongsTo(User, {foreignKey: 'userId'});
```

If no relations value is specified, a default value as the name of the target model + s is generated.

- Many-to-many association: let's say you have two models Tag and Post, and a tag can be attached to many posts, and a post can have many tags. For this association, you have to annotate both your source and target models with the keyword `relations` that will hold the relations on each model:

```javascript
/**
 * @swag
 * relations: Tags
 */
Post.belongsToMany(Tag, {through: PostTags});
/**
 * @swag
 * relations: Posts
 */
Tag.belongsToMany(Post, {through: PostTags});
```

## In services

A service is a YAML file that describes the API endpoints (paths, request payload, response of a request, etc.). It is stored in the folder `servicesPath` as described in the `sequelize2openapi.json` configuration file. Its content is something like:

```yaml
ModelName:
  collectionOperations:
    get:
      openapi_context:
        summary: "List all items"
        description: "Get paginated list of items"
      output:
        - "modelname:list"
    post:
      openapi_context:
        summary: "Create new item"
        description: "Create a new item"
      input:
        - "modelname:post"
      output:
        - "modelname:item"
      isCreation: true
  
  itemOperations:
    get:
      openapi_context:
        summary: "Get item by ID"
        description: "Get single item by its ID"
      output:
        - "modelname:item"
    put:
      openapi_context:
        summary: "Update item"
        description: "Update existing item"
      input:
        - "modelname:put"
      output:
        - "modelname:item"
    delete:
      openapi_context:
        summary: "Delete item"
        description: "Delete an item"
```

### Options

The service file begins with the name of the model.

- `collectionOperations`: act on a list of resources or the entire collection of a resource. Typically, you would use collection operations for actions like listing all resources or creating a new resource. Example: GET /users (list all users), POST /users (create a new user).
- `itemOperations`: act on individual resources (items) identified by a unique identifier (often include actions like retrieving, updating, or deleting a single resource. Example: GET /users/{id} (get a user by ID), PUT /users/{id} (update a user by ID).)
- On each operation, for default routes, you specify the route method (for collection they are `post` and `get`, for item they are `get`, `put`, `post` (in rare case) and `delete`)
- `openapi_context`: Description of the routes
    - `summary`: Summary of the route
    - `description`: Long description of the route
- `output`: Fields output to show in responses of a request. It takes an array of a string like this: **model:method**, **model** is the name of the model in lowercase and **method** is the value as described in the Sequelize model annotation **methods**.
- `input`: Fields input to show in request payload of a route. This option is basically declared on `put` or `post` operation.

### CLI tool

Sequelize2OpenAPI offers a CLI tool to automatically generate the default service file based on a Sequelize model, by running `sequelize2openapi --m ModelName`. This creates a service file in your configured `servicesPath` with default content for the specified model.

### Custom operations

You can define custom routes that don't follow the standard CRUD patterns.

```yaml
Model:
  custom_path:
    tags: "Custom path"
    path: "/custom/path"
    method: "POST"
    openapi_context:
        summary: "Custom path"
        description: "Declaring custom path"
    input:
        - "model:post"
    output:
        - "model:custom"
```

### Custom output

If annotating Sequelize models fields are unsufficient, you can declare custom fields to your responses. There are 3 types of custom output.
- `inline`: If custom is type of string, the declared custom fields will be appended directly in the other fields.
```yaml
output:
  - "model:custom"
  - custom:
      type: "inline"
      items:
        - type: "object"
          properties:
            access_token:
              type: "string"
              description: "Access token"
              example: "Access token"
            refresh_token:
              type: "string"
              description: "Refresh token"
              example: "Refresh token"
```
This will output in the OpenAPI specifications something like:
```json
{
    "model": {},
    "access_token": {
        "type": "string",
        "description": "Access token",
        "example": "Access token"
    },
    "refresh_token": {
        "type": "string",
        "description": "Refresh token",
        "example": "Refresh token"
    }
}
```

- `object`: If custom is type of object, the declared custom fields will be appended directly in the output other fields as an object.
```yaml
output:
  - "model:custom"
  - custom:
      type: "object"
      items:
        - type: "object"
          properties:
            access_token:
              type: "string"
              description: "Access token"
              example: "Access token"
            refresh_token:
              type: "string"
              description: "Refresh token"
              example: "Refresh token"

```
This will output in the OpenAPI specifications something like:
```json
{
	"model": {},
	"tokens": {
		"access_token": {
			"type": "string",
			"description": "Access token",
			"example": "Access token"
		},
		"refresh_token": {
			"type": "string",
			"description": "Refresh token",
			"example": "Refresh token"
		}
	}
}
```

- `array`: If custom is type of array, the declared custom fields will be appended directly in the output other fields as an array.
```yaml
output:
  - "model:custom"
  - custom:
      type: "array"
      items:
        - type: "object"
          properties:
            access_token:
              type: "string"
              description: "Access token"
              example: "Access token"
            refresh_token:
              type: "string"
              description: "Refresh token"
              example: "Refresh token"

```
This will output in the OpenAPI specifications something like:
```json
{
	"model": {},
	"tokens": [
		{
			"access_token": {
				"type": "string",
				"description": "Access token",
				"example": "Access token"
			},
			"refresh_token": {
				"type": "string",
				"description": "Refresh token",
				"example": "Refresh token"
			}
		}
	]
}
```

# Best Practices

1. Keep your model annotations up-to-date with your actual API behavior
2. Use descriptive field descriptions to help API consumers
3. Explicitly specify which methods include each field for clarity
4. Regularly review the generated documentation to ensure accuracy
5. Use the CLI tool to bootstrap new service files when adding models

# Support

For issues or feature requests, please contact Hasininjato Rojovao or open an issue in the project repository.