const { modelParser } = require("./src/parsers/modelParser");
const { getSchema } = require('@mrleebo/prisma-ast');
const fs = require('fs');

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
  title     String @unique @default("Untitled") @db.VarChar(100)
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields:  [authorId], references: [id])
  authorId  Int?
  createdAt   DateTime @default(now())
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique(false)
  fullname  String @unique
  password String
  posts Post[]
}
`

const schemas = getSchema(source);
fs.writeFileSync("../prisma.json", JSON.stringify(schemas, null, 4));
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
			if (property.type === "field") {
				const valueItem = {
					field: property.name,
					type: "field",
					object: {
						type: property.fieldType,
						allowNull: property.optional,
					}
				}
				if (property.attributes) {
					if (!property?.optional) {
						// check if the field is not id
						for (const attribute of Object.values(property?.attributes)) {
							// if field is type of id, no need to add validate rules
							if (attribute.name === "id") break;
							valueItem.object.validate = {
								notNull: { msg: `${property.name} is required` },
								notEmpty: { msg: `${property.name} cannot be empty` }
							};
						}
					}
				} else {
					valueItem.object.validate = {
						notNull: { msg: `${property.name} is required` },
						notEmpty: { msg: `${property.name} cannot be empty` }
					};
				}
				property.attributes?.forEach((attr) => {
					// get default value of the field
					if (attr.name === "default") {
						valueItem.object.defaultValue = attr.args[0].value.name ?? attr.args[0].value;
					}
					// get unique field
					if (attr.name === "unique") {
						valueItem.object.unique = {
							name: `unique_${property.name}`,
							msg: `This ${property.name} is already in use`
						};
					}
				})
				model.value.push(valueItem);
			}
		}
		models.push(model);
	}
}
// console.log(JSON.stringify(models, null, 4));
fs.writeFileSync("../prisma-models.json", JSON.stringify(models, null, 4));