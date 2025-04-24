const { modelParser } = require('./src/modelParser');
const { getFileInDirectory, readFileContent } = require("./src/utils/utils");
const serviceParser = require("./src/serviceParser");
const fs = require("fs");

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

    const content = fs.readFileSync("../backend/app/docs/services/user.yaml", "utf8");
    serviceParser(content, routesVariable, routePrefix);
}

module.exports = parser;