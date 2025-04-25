const {modelParser} = require('./src/parsers/modelParser');
const {getFileInDirectory, readFileContent} = require("./src/utils/utils");
const serviceParser = require("./src/parsers/serviceParser");
const fs = require("fs");
const createParameters = require("./src/creators/parameterCreator");
const createSchemas = require('./src/creators/schemaCreator');
const createResponse = require('./src/creators/responseCreator');
const createRequestBody = require("./src/creators/requestBodyCreator");

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

    const schemas = createSchemas(models)

    if (schemas && typeof schemas === 'object') {
        const response = {
            type: "object",
            properties: {
                details: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            field: {
                                type: "string",
                                description: "Name of the field"
                            },
                            message: {
                                type: "string",
                                description: "Message on validation"
                            }
                        }
                    }
                }
            }
        }
        schemas["Response400Schema"] = response;
        schemas["Response409Schema"] = response;
    }

    const openApiInfo = {
        openapi: swaggerDefinition.openapi,
        info: swaggerDefinition.info,
        servers: swaggerDefinition.servers
    }
    const components = {
        components: {}
    }
    let services = {};
    const servicesFiles = getFileInDirectory(servicesPath);
    let openApiSpec = {};
    servicesFiles.forEach(file => {
        const content = readFileContent(`${servicesPath}/${file}`);
        const parameters = createParameters(routesVariable);
        components.components["parameters"] = parameters;
        components.components["schemas"] = schemas;
        services = serviceParser(content, routesVariable, routePrefix, parameters);
        createRequestBody(services, schemas);
        createResponse(services, schemas, models);
        fs.writeFileSync("../swaggelize/services.json", JSON.stringify(services, null, 4))

        openApiSpec = {
            ...openApiInfo,
            ...components,
            paths: services
        }
    })
    fs.writeFileSync("../swaggelize/services-full.json", JSON.stringify(openApiSpec, null, 4))
}

module.exports = parser;