const fs = require('fs');
const parseModel = require("./parsers/parseModel");

const source = fs.readFileSync("./schema.prisma", 'utf8');

const models = parseModel(source);

fs.writeFileSync("../prisma-models.json", JSON.stringify(models, null, 4));