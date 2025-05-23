const fs = require('fs');
const { generateModels } = require("./parsers/generateModels");

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
  // @swag | description: Unique identifier for the post | methods: list, item
  id        Int     @id @default(autoincrement())
  // @swag | description: Title of the post | methods: list, item, post, put
  title     String @unique @db.VarChar(100)
  // @swag | description: Content of the post | methods: list, item, post, put
  content   String?
  // @swag | description: Published status of the post | methods: list, item, post, put
  published Boolean
  author    User?   @relation(fields:  [authorId], references: [id])
  authorId  Int?
  createdAt   DateTime @default(now())
}

model User {
  // @swag | description: Unique identifier for the user | methods: list, item
  id    Int     @id @default(autoincrement())
  // @swag | description: Email of the user | methods: list, item, post, put
  email String  @unique(false)
  // @swag | description: Fullname of the user | methods: list, item, post, put
  fullname  String @unique
  // @swag | description: Password of the user | methods: post, put
  password String
  posts Post[]
}
`

const { schemas, models } = generateModels(source);

fs.writeFileSync("../prisma.json", JSON.stringify(schemas, null, 4));
fs.writeFileSync("../prisma-models.json", JSON.stringify(models, null, 4));