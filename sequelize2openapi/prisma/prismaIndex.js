const fs = require('fs');
const { generateModels } = require("./parsers/parseModel");

const source = fs.readFileSync("./schema.prisma", 'utf8');

const { schemas, models } = generateModels(source);

fs.writeFileSync("../prisma.json", JSON.stringify(schemas, null, 4));
fs.writeFileSync("../prisma-models.json", JSON.stringify(models, null, 4));