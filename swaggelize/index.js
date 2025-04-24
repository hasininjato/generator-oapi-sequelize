const { modelParser } = require('./src/parsers/modelParser');
const { getFileInDirectory, readFileContent } = require("./src/utils/utils");
const serviceParser = require("./src/parsers/serviceParser");
const fs = require("fs");
const createParameters = require("./src/creators/componentCreator");

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

    const openApi = {
        openapi: swaggerDefinition.openapi,
        info: swaggerDefinition.info,
        servers: swaggerDefinition.servers
    }
    console.log(swaggerDefinition)
    const components = {
        components: {}
    }
    const content = fs.readFileSync("../backend/app/docs/services/tag.yaml", "utf8");
    const parameters = createParameters(routesVariable);
    components.components["parameters"] = parameters;
    serviceParser(content, routesVariable, routePrefix, parameters);
}

module.exports = parser;