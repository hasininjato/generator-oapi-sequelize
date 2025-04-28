# About

OpenAPI Sequelize: generate OpenAPI specs, by annotating Sequelize models.

# Install

Install dependencies in the backend examples project and in the swaggelize folder with the command `npm i`

# Usage

## In your models

### Simple usage

In your Sequelize model, declare your model and annotate your fields with the `@swag` comment like this

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

where `description` is the description of the field and `methods` is the group where the fields will be used in your api
endpoints.

### Usage with relationships

There are three different associations type in Sequelize and you have to annotate your association accordingly:

- One-to-one association: you don't need to specify nothing on this type of association

```javascript
User.hasOne(Profile);
Profile.belongsTo(User);
```

- One-to-many association: let's say you have two models User and Transaction, and one user has many transactions and a
  transaction is attached to only one user.
  For this association, you have to annotate your source model (here the User model) with a keyword like this:

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

which means on each user, there is a `Transactions` key which holds his/her transactions. If you don't specify so, a
default value as the name of the target model + s
is generated.

- Many-to-many association: let's say you have two models Tag and Post, and a tag can be attached to many posts, and a
  post can have many tags. For this association,
  you have to annotate both your source and target models with keywords that will hold the relations on each model:

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

## In your services YAML files

To hold the description of your API endpoints (paths, input or response of a request and so on), you need to create a
`docs/services` folder inside your project. Inside it, create a YAML config file for each of your model. Its content is
like below:

```yaml
User:
  collectionOperations:
    get:
      openapi_context:
        summary: "List of all users"
        description: "List of all users"
      output:
        - "user:list"
        - "profile:item"
    post:
      openapi_context:
        summary: "Create a user"
        description: "Create a user"
      input:
        - "user:post"
        - "profile:post"
      output:
        - "user:item"
        - "profile:item"
    login:
      tags: "Authentication"
      path: "/auth/login"
      method: "POST"
      openapi_context:
        summary: "Login an user"
        description: "Login an user"
      input:
        - "user:item"
      output:
        - "user:item"
    validate_token:
      tags: "Token"
      path: "/validate/token"
      method: "GET"
      openapi_context:
        summary: "Validate token sent in parameter"
        description: "Validate token sent in parameter"
      input:
        - user:item
      params:
        query:
          name: "token"
  itemOperations:
    get:
      openapi_context:
        summary: "Get user by id"
        description: "Get user by id"
      output:
        - "user:item"
    put:
      openapi_context:
        summary: "Update an user by id"
        description: "Update an user by id"
      input:
        - "user:put"
      output:
        - "user:item"
    delete:
      openapi_context:
        summary: "Delete an user by id"
        description: "Delete an user by id"
    create_transaction:
      tags: "Transaction"
      method: "POST"
      path: "/users/{id}/transactions"
      openapi_context:
        summary: "Creation of a transaction of a user"
        description: "Create a transaction of the user sent in param"
      input:
        - "transaction:post"
      output:
        - "transaction:item"
    list_transaction:
      tags: "Transaction"
      method: "GET"
      path: "/users/{id}/transactions"
      openapi_context:
        summary: "List of all transactions of an user by id"
        description: "List of all transactions of an user by id"
      output:
        - "user:item"
        - "transaction:list"
    list_transaction_with_name:
      tags: "Transaction"
      method: "GET"
      path: "/users/{id}/transactions/{name}"
      openapi_context:
        summary: "List of all transactions with name of an user by id"
        description: "List of all transactions with name of an user by id"
      output:
        - "user:item"
        - "transaction:list"
```

First, you declare the name of the model in the first line. Then you declare `collectionOperations` (which act on a list
of resources or the entire collection of a resource. Typically, you would use collection operations for actions like
listing all resources or creating a new resource. Example: GET /users (list all users), POST /users (create a new
user).) and `itemOperations` that act on individual resources (items) identified by a unique identifier (They often
include actions like retrieving, updating, or deleting a single resource. Example: GET /users/{id} (get a user by ID),
PUT /users/{id} (update a user by ID).). In each operation, for default routes, you specify the route method (for
collection they are `post` and `get`, for item they are `get`, `put`, `post` (in rare case) and `delete`).