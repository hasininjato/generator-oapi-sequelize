# Sequelize2OpenAPI Documentation

## Overview

Sequelize2OpenAPI is a tool that automatically generates OpenAPI specifications (formerly Swagger) for Express.js API applications by analyzing annotations directly written in Sequelize models. This allows developers to maintain API documentation alongside their data models, ensuring consistency and reducing documentation overhead.

## Installation

Install the package using npm:

```bash
npm i sequelize2openapi
```

## Configuration

Create a configuration file named `sequelize2openapi.json` in your project root with the following structure:

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

### Configuration Options

- **openApiDefinition**: Base OpenAPI specification that will be extended with your model definitions
  - **openapi**: OpenAPI version (currently 3.0.0)
  - **info**: Metadata about your API
  - **servers**: Array of server URLs where the API is hosted
- **servicesPath**: Path to where service files (based on models) are stored
- **modelsPath**: Folder containing your Sequelize models
- **defaultSecurity**: Default security scheme for API endpoints (e.g., "jwt")
- **routePrefix**: Prefix for all API routes (e.g., "/api")

## Usage

### Basic Integration

In your Express.js application:

```javascript
const sequelize2openapi = require('sequelize2openapi');
const swaggerUi = require('swagger-ui-express');

try {
  const swaggerSpec = sequelize2openapi(app);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (err) {
  throw err;
}
```

### CLI Tool

The package includes a CLI tool to generate default service files:

```bash
sequelize2openapi -m ModelName
```

This creates a service file in your configured `servicesPath` with default content for the specified model.

## Model Annotations

Annotate your Sequelize models with `@swag` comments to define API documentation:

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
     * methods: list, item, put, post
     */
    bio: DataTypes.TEXT
});
```

### Field Annotation Options

- **description**: Description of the field that will appear in the API documentation
- **methods**: Operations where this field is included (defaults: item, list, put, post)
  - Other possible values depend on your API implementation
  - Typically corresponds to CRUD operations (get, post, put, delete) or custom methods

## Generated API Documentation

Based on your model annotations, Sequelize2OpenAPI will generate:

1. **Schema definitions** for each model
2. **Endpoint documentation** for standard CRUD operations
3. **Parameter documentation** for query parameters and request bodies
4. **Response documentation** for successful and error responses

The documentation will be available at the `/docs` endpoint (or whatever path you configure).

## Best Practices

1. Keep your model annotations up-to-date with your actual API behavior
2. Use descriptive field descriptions to help API consumers
3. Explicitly specify which methods include each field for clarity
4. Regularly review the generated documentation to ensure accuracy
5. Use the CLI tool to bootstrap new service files when adding models

## Support

For issues or feature requests, please contact Hasininjato Rojovao or open an issue in the project repository.





# Enhanced Sequelize2OpenAPI Documentation

## Service Files with Custom Operations

The service files in Sequelize2OpenAPI support both standard CRUD operations (automatically generated from your model) and custom operations with extended configuration.

### Standard CRUD Service File (Basic Structure)

For standard operations, you can use this simplified format:

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

### Custom Operations

You can define custom routes that don't follow the standard CRUD pattern:

```yaml
login:
  tags: "Authentication"
  path: "/auth/login"
  method: "POST"
  openapi_context:
    summary: "Login an user"
    description: "Authenticate user credentials"
    # Responses are automatically generated but can be extended
    responses:
      401:
        description: "Invalid credentials"
  input:
    - "user:login"  # Fields marked with methods: login in User model
  output:
    - "user:login"   # Response fields marked with methods: login
```

### Key Features

1. **Automatic Response Generation**:
   - 200/201 responses are automatically generated based on `output` definitions
   - Error responses (400, 401, 404, 500) are added by default

2. **Custom Response Overrides**:
   ```yaml
   get:
     openapi_context:
       responses:
         200:
           description: "Custom success message"
         404:
           description: "Custom not found message"
   ```

3. **Creation Flag** (`isCreation`):
   ```yaml
   post:
     isCreation: true  # Generates 201 response instead of 200
     output:
       - "modelname:item"
   ```

4. **Input/Output Mapping**:
   - References fields annotated with specific methods in your Sequelize model
   - Example: `"user:login"` uses fields marked with `@swag` and `methods: login`

## Complete Example with Mixed Operations

```yaml
# user.yaml
User:
  collectionOperations:
    get:
      openapi_context:
        summary: "List users"
        description: "Get paginated list of users"
        tags: ["User Management"]
      output:
        - "user:list"
  
    post:
      openapi_context:
        summary: "Create user"
        description: "Register a new user"
        tags: ["User Management"]
      input:
        - "user:post"
      output:
        - "user:item"
      isCreation: true

  itemOperations:
    get:
      openapi_context:
        summary: "Get user details"
        description: "Get complete user information"
        tags: ["User Management"]
      output:
        - "user:item"
    
    put:
      openapi_context:
        summary: "Update user"
        description: "Update user information"
        tags: ["User Management"]
      input:
        - "user:put"
      output:
        - "user:item"

# Custom authentication operations
login:
  tags: "Authentication"
  path: "/auth/login"
  method: "POST"
  openapi_context:
    summary: "User login"
    description: "Authenticate user credentials"
  input:
    - "user:login"
  output:
    - "user:login"

refreshToken:
  tags: "Authentication"
  path: "/auth/refresh"
  method: "POST"
  openapi_context:
    summary: "Refresh access token"
    description: "Get new access token using refresh token"
  input:
    - "user:refresh"
  output:
    - "user:login"
```

## Model Annotations for Custom Operations

Your Sequelize model should include fields marked for custom operations:

```javascript
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
   * description: Password for login (write-only)
   * methods: login, post
   */
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  /**
   * @swag
   * description: Authentication token
   * methods: login, refresh
   */
  token: {
    type: DataTypes.STRING
  }
});
```

## CLI Tool Usage

The CLI tool generates appropriate service file templates:

```bash
# Generate standard CRUD service file
sequelize2openapi -m User

# Generate with custom operations (hypothetical extended CLI)
sequelize2openapi -m User
```

Would generate a starter file with both standard CRUD operations and skeletons for your custom operations.

## Best Practices

1. Use `isCreation: true` for POST operations that create resources
2. Organize operations with tags for better UI grouping
3. Keep custom operation names consistent with your route implementations
4. Document all custom methods in your model fields
5. Use separate service files for logically distinct resource groups




# Sequelize2OpenAPI Relationship Annotations

This documentation explains how to annotate Sequelize relationships for proper OpenAPI documentation generation.

## Relationship Annotations Overview

Sequelize2OpenAPI supports documenting model relationships through special annotations. These annotations help the generator understand how to represent relationships in the OpenAPI specification.

## One-to-One Relationships

For one-to-one relationships, no special annotations are needed. The generator will automatically detect and document these relationships based on your Sequelize associations.

```javascript
// No annotations needed for one-to-one
User.hasOne(Profile);
Profile.belongsTo(User);
```

## One-to-Many Relationships

For one-to-many relationships, add a `@swag` annotation with `relations` property on the parent model's `hasMany` association.

### Parent Model Example

```javascript
const Parent = sequelize.define('Parent', {
  name: DataTypes.STRING
});

/**
 * @swag
 * relations: Children
 */
Parent.hasMany(Child);
Child.belongsTo(Parent);
```

This will:
1. Include the children in the parent's API responses
2. Generate proper OpenAPI schemas showing the relationship
3. Document the nested structure in the API documentation

## Many-to-Many Relationships

For many-to-many relationships, add a `@swag` annotation with `relations` property on BOTH models' associations.

### Example for Both Models

```javascript
const User = sequelize.define('User', {
  name: DataTypes.STRING
});

const Project = sequelize.define('Project', {
  title: DataTypes.STRING
});

/**
 * @swag
 * relations: Project
 */
User.belongsToMany(Project, { through: 'UserProjects' });

/**
 * @swag
 * relations: User
 */
Project.belongsToMany(User, { through: 'UserProjects' });
```

## Complete Model Example

Here's a complete example showing all relationship types:

```javascript
const User = sequelize.define('User', {
  /**
   * @swag
   * description: User's full name
   * methods: list, item, post
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Profile = sequelize.define('Profile', {
  bio: DataTypes.TEXT
});

// One-to-one (no annotation needed)
User.hasOne(Profile);
Profile.belongsTo(User);

const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  content: DataTypes.TEXT
});

// One-to-many (annotate on parent)
/**
 * @swag
 * relations: Post
 */
User.hasMany(Post);
Post.belongsTo(User);

const Tag = sequelize.define('Tag', {
  name: DataTypes.STRING
});

// Many-to-many (annotate both sides)
/**
 * @swag
 * relations: Tag
 */
Post.belongsToMany(Tag, { through: 'PostTags' });

/**
 * @swag
 * relations: Post
 */
Tag.belongsToMany(Post, { through: 'PostTags' });
```

## Generated OpenAPI Effects

These annotations will produce:

1. **Schema Definitions**:
   ```yaml
   User:
     type: object
     properties:
       name:
         type: string
       Profile:
         $ref: '#/components/schemas/Profile'
       Posts:
         type: array
         items:
           $ref: '#/components/schemas/Post'
   ```

2. **Proper Nested Documentation** in endpoint responses
3. **Relationship Documentation** in the API spec

## Service File Considerations

When using relationships, your service file might look like:

```yaml
User:
  collectionOperations:
    get:
      output:
        - "user:list"
        - "profile:item"  # Include related profile
        - "post:list"     # Include related posts
```

## Best Practices

1. Always annotate both sides of many-to-many relationships
2. For one-to-many, only annotate the parent's `hasMany`
3. Keep relationship names consistent with model names
4. Document complex relationships in model comments
5. Verify generated documentation shows relationships correctly

## CLI Tool Support

The CLI tool will automatically detect relationships when generating service files:

```bash
sequelize2openapi -m User
```

Will generate a service file that includes references to all related models based on your annotations.


# Sequelize2OpenAPI Relationship Handling - Simplified Approach

## Relationship Documentation Rules

### 1. One-to-One Relationships

**Model Definition:**
```javascript
Parent.hasOne(Child);
Child.belongsTo(Parent);
```

**Service File Usage:**
```yaml
Parent:
  itemOperations:
    get:
      output:
        - "parent:item"
        - "child:item"   # Include related child
    post:
      input:
        - "parent:post"
        - "child:post"   # Include child in creation
    put:
      input:
        - "parent:put"
        - "child:put"    # Include child in update
```

### 2. One-to-Many Relationships

**Model Definition:**
```javascript
/**
 * @swag
 * relations: Children
 */
Parent.hasMany(Child);
Child.belongsTo(Parent);
```

**Service File Usage:**
```yaml
Parent:
  itemOperations:
    get:
      output:
        - "parent:item"
        - "children:list"  # Include children list
```

### 3. Many-to-Many Relationships

**Model Definition (both sides):**
```javascript
/**
 * @swag
 * relations: Project
 */
User.belongsToMany(Project, { through: 'UserProjects' });

/**
 * @swag
 * relations: User
 */
Project.belongsToMany(User, { through: 'UserProjects' });
```

**Service File Usage:**
```yaml
User:
  itemOperations:
    get:
      output:
        - "user:item"
        - "projects:list"  # Include related projects
```

## Complete Example

### Model Definitions

```javascript
// User model
const User = sequelize.define('User', {
  /**
   * @swag
   * description: User's name
   * methods: item, post, put
   */
  name: DataTypes.STRING
});

// Profile model (one-to-one)
const Profile = sequelize.define('Profile', {
  /**
   * @swag
   * description: Profile bio
   * methods: item, post, put
   */
  bio: DataTypes.TEXT
});

User.hasOne(Profile);
Profile.belongsTo(User);

// Post model (one-to-many)
const Post = sequelize.define('Post', {
  /**
   * @swag
   * description: Post title
   * methods: item, list, post, put
   */
  title: DataTypes.STRING
});

/**
 * @swag
 * relations: Post
 */
User.hasMany(Post);
Post.belongsTo(User);
```

### Service File (user.yaml)

```yaml
User:
  collectionOperations:
    get:
      output:
        - "user:list"
    post:
      input:
        - "user:post"
        - "profile:post"
      isCreation: true
  
  itemOperations:
    get:
      output:
        - "user:item"
        - "profile:item"
        - "posts:list"
    put:
      input:
        - "user:put"
        - "profile:put"

Profile:
  itemOperations:
    get:
      output:
        - "profile:item"
        - "user:item"

Post:
  collectionOperations:
    get:
      output:
        - "post:list"
        - "user:item"
    post:
      input:
        - "post:post"
      isCreation: true
  
  itemOperations:
    get:
      output:
        - "post:item"
        - "user:item"
    put:
      input:
        - "post:put"
```

## Key Points

1. **No Explicit Response/Body Definitions**:
   - The framework automatically generates these based on your input/output references

2. **Relationship Inclusion**:
   - Reference related models directly in input/output sections
   - Use `modelname:method` format consistently

3. **Naming Conventions**:
   - For one-to-many: Use plural form in output (`posts:list`)
   - For one-to-one: Use singular form (`profile:item`)

4. **Automatic Schema Generation**:
   - Relationships will automatically appear in the OpenAPI schemas
   - Proper `$ref` references will be created

## Best Practices

1. **Consistent Method Tags**:
   - Ensure related models have fields marked with matching methods
   - Example: If using `profile:post`, Profile model must have fields with `methods: post`

2. **Minimal Service Files**:
   - Only specify what differs from defaults
   - Let the generator handle response structures

3. **Relationship Annotations**:
   - Always add `@swag relations` annotations for hasMany and belongsToMany
   - No annotations needed for hasOne/belongsTo

4. **Creation Handling**:
   - Use `isCreation: true` for POST operations
   - Include all creatable relationships in input

This approach keeps your documentation tightly coupled with your model definitions while minimizing boilerplate in service files.