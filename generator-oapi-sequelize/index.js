const {modelParser, addRelationManyToManyToEachModel, getAllMethods} = require('./src/parsers/modelParser');
const {getFileInDirectory, readFileContent, removeInputOutput} = require("./src/utils/utils");
const serviceParser = require("./src/parsers/serviceParser");
const createParameters = require("./src/creators/parameterCreator");
const createSchemas = require('./src/creators/schemaCreator');
const createResponse = require('./src/creators/responseCreator');
const createRequestBody = require("./src/creators/requestBodyCreator");
const path = require('path');

function getModels(modelsPath, modelsFiles) {
    const models = []
    modelsFiles.forEach(file => {
        const code = readFileContent(`${modelsPath}/${file}`)
        models.push(...modelParser(code).filter(m => !Array.isArray(m)));
    })

    return models;
}

function parser(swaggelizeOptions) {
    try {
        const configPath = path.join(require.main.path, 'generator-oapi-sequelize.json');
        const swaggerDefinition = require(configPath);

        const servicesPath = swaggelizeOptions.servicesPath;
        const modelsPath = swaggelizeOptions.modelsPath;
        const routesVariable = swaggelizeOptions.routesVariable;
        const routePrefix = swaggelizeOptions.routePrefix;

        const modelsFiles = getFileInDirectory(modelsPath);
        const models = getModels(modelsPath, modelsFiles);

        addRelationManyToManyToEachModel(models);

        const methodsToProcess = getAllMethods(models);
        const schemas = createSchemas(models, methodsToProcess)

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
        let services = {}; // This will accumulate ALL services
        const servicesFiles = getFileInDirectory(servicesPath);
        let openApiSpec = {};

        servicesFiles.forEach(file => {
            const content = readFileContent(`${servicesPath}/${file}`);
            const parameters = createParameters(routesVariable);
            components.components["parameters"] = parameters;
            components.components["schemas"] = schemas;

            // Get the service definition for this file
            const currentService = serviceParser(content, routesVariable, routePrefix, parameters);

            // Merge the current service into the accumulated services
            services = {...services, ...currentService};

            createRequestBody(currentService, schemas, models, true);
            createResponse(currentService, schemas, models);

            // Update openApiSpec with the accumulated services
            openApiSpec = {
                ...openApiInfo,
                ...components,
                paths: services // Now contains all merged services
            };
        });

        removeInputOutput(openApiSpec);
        return openApiSpec;
    } catch (err) {
        throw new Error("Configuration file generator-oapi-sequelize.json is missing. Create it as described in the documentation.");
    }
}

module.exports = parser;