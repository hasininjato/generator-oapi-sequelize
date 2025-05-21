const { modelParser } = require("./src/parsers/modelParser");
const { getSchema } = require('@mrleebo/prisma-ast');

const source = `
// Data source
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Generator
generator client {
  provider = "prisma-client-js"
}

// Data model
model Post {
  id        Int     @id @default(autoincrement())
  // @swag | description: Title of the post | methods: list, item, post, put
  title     String
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields:  [authorId], references: [id])
  authorId  Int?
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
`
const schemas = getSchema(source);

let models = [];
for (const schema of Object.values(schemas.list)) {
    let model = {}
    if (schema.type === "model") {
        const sequelizeModel = schema.name;
        model = {
            sequelizeModel: sequelizeModel,
            value: []
        }
        for (const property of schema.properties) {
            console.log(JSON.stringify(property, null, 2));
            const valueItem = {
                field: property.name,
                type: "field",

            }
        }
        models.push(model);
    }
}
console.log(models);