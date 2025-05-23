const { modelParser } = require("./src/parsers/modelParser");
const { getSchema } = require('@mrleebo/prisma-ast');
const fs = require('fs');
const { capitalizeFirstLetter } = require("./src/utils/utils");

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
  // @swag | description: Title of the post | methods: list, item, post
  title     String @unique @default(Untitled) @db.VarChar(100)
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

function parseComment(comment) {
	if (!comment.includes("@swag")) return null;

	const result = {};
	const parts = comment.replace("// @swag", "").split("|");
	for (const part of parts) {
		const [key, val] = part.split(":").map((s) => s.trim());
		if (key && val) {
			if (key === "description") {
				result.description = val;
			} else if (key === "methods") {
				result.methods = val.split(",").map((s) => s.trim());
			} else {
				result[key] = val;
			}
		}
	}
	return result;
}

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
		let comment = null;
		for (const property of schema.properties) {
			if (property.type === "comment") {
				comment = parseComment(property.text);
			}
			if (property.type === "field") {
				const valueItem = {
					field: property.name,
					type: "field",
					object: {
						type: property.fieldType,
						allowNull: property.optional,
					}
				}
				if (comment) {
					valueItem.comment = { ...comment }
				}
				comment = null;
				if (property.attributes) {
					if (!property?.optional) {
						// check if the field is not id
						for (const attribute of Object.values(property?.attributes)) {
							// if field is type of id, no need to add validate rules
							if (attribute.name === "id") break;
							valueItem.object.validate = {
								notNull: { msg: `${capitalizeFirstLetter(property.name)} is required` },
								notEmpty: { msg: `${capitalizeFirstLetter(property.name)} cannot be empty` }
							};
						}
					}
				} else {
					valueItem.object.validate = {
						notNull: { msg: `${capitalizeFirstLetter(property.name)} is required` },
						notEmpty: { msg: `${capitalizeFirstLetter(property.name)} cannot be empty` }
					};
				}
				property.attributes?.forEach((attr) => {
					// get default value of the field
					if (attr.name === "default") {
						valueItem.object.defaultValue = attr.args[0].value.name ?? attr.args[0].value;
						console.log(attr.args[0].value.name ?? attr.args[0].value)
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