const { modelParser } = require('./src/modelParser');
const { getFileInDirectory, readFileContent } = require("./src/utils/utils");
const serviceParser = require("./src/serviceParser");
const fs = require("fs");
const generateParameters = require("./src/routeParser");

function getModels(modelsPath, modelsFiles) {
    const models = []
    modelsFiles.forEach(file => {
        const code = readFileContent(`${modelsPath}/${file}`)
        models.push(...modelParser(code).filter(m => !Array.isArray(m)));
    })

    return models;
}

function parser(swaggelizeOptions) {
    const swaggerDefinition = swaggelizeOptions.swaggerDefinition;
    const servicesPath = swaggelizeOptions.servicesPath;
    const modelsPath = swaggelizeOptions.modelsPath;
    const routesVariable = swaggelizeOptions.routesVariable;
    const middlewareAuth = swaggelizeOptions.middlewareAuth;
    const routePrefix = swaggelizeOptions.routePrefix;

    const modelsFiles = getFileInDirectory(modelsPath);
    const models = getModels(modelsPath, modelsFiles);

    const content = fs.readFileSync("../backend/app/docs/services/tag.yaml", "utf8");
    const parameters = generateParameters(routesVariable);
    serviceParser(content, routesVariable, routePrefix, parameters);
}

module.exports = parser;