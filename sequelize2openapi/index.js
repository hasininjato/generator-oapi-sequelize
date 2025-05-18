const { modelParser, addRelationManyToManyToEachModel, getAllMethods } = require('./src/parsers/modelParser');
const { getFileInDirectory, readFileContent, removeKeyDeep} = require("./src/utils/utils");
const serviceParser = require("./src/parsers/serviceParser");
const createParameters = require("./src/creators/parameterCreator");
const createSchemas = require('./src/creators/schemaCreator');
const createResponse = require('./src/creators/responseCreator');
const createRequestBody = require("./src/creators/requestBodyCreator");
const path = require('path');

function getModels(modelsPath) {
    const modelsFiles = getFileInDirectory(modelsPath);
    const models = []
    modelsFiles.forEach(file => {
        const code = readFileContent(`${modelsPath}/${file}`)
        models.push(...modelParser(code).filter(m => !Array.isArray(m)));
    })

    return models;
}

function parser(routesVariable) {
    try {
        const configPath = path.join(require.main.path, 'sequelize2openapi.json');
        const sequelizeConfig = require(configPath);

        const servicesPath = sequelizeConfig.servicesPath;
        const modelsPath = sequelizeConfig.modelsPath;
        const routePrefix = sequelizeConfig.routePrefix;

        const models = getModels(modelsPath);
        // let modelsName = models.map(model => model.sequelizeModel);

        let modelsName = [];
        models.map(model => {
            modelsName.push(model.sequelizeModel)
        })
        addRelationManyToManyToEachModel(models);

        const methodsToProcess = getAllMethods(models);
        const schemas = createSchemas(models, methodsToProcess)

        if (schemas && typeof schemas === 'object') {
            const response = {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Name of the error",
                        example: "ValidationError",
                        enum: ["ValidationError", "UniqueConstraintError"]
                    },
                    errors: {
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
            openapi: sequelizeConfig.openApiDefinition.openapi,
            info: sequelizeConfig.openApiDefinition.info,
            servers: sequelizeConfig.openApiDefinition.servers
        }
        const components = {
            components: {}
        }
        let services = {}; // This will accumulate ALL services
        const servicesFiles = getFileInDirectory(servicesPath);
        let openApiSpec = {};

        servicesFiles.forEach(file => {
            const content = readFileContent(`${servicesPath}/${file}`);
            components.components["parameters"] = createParameters(routesVariable);
            components.components["schemas"] = schemas;

            // Get the service definition for this file
            const currentService = serviceParser(content, routesVariable, routePrefix);

            // Merge the current service into the accumulated services
            services = { ...services, ...currentService };

            createRequestBody(currentService, schemas, models, modelsName, components);
            createResponse(currentService, schemas, models, modelsName);

            // Update openApiSpec with the accumulated services
            openApiSpec = {
                ...openApiInfo,
                ...components,
                paths: services // Now contains all merged services
            };
        });

        openApiSpec = removeKeyDeep(openApiSpec, "input");
        openApiSpec = removeKeyDeep(openApiSpec, "output");
        openApiSpec = removeKeyDeep(openApiSpec, "isCreation");
        openApiSpec = removeKeyDeep(openApiSpec, "customPath");
        openApiSpec = removeKeyDeep(openApiSpec, "model");
        openApiSpec = removeKeyDeep(openApiSpec, "filterableFields");
        return openApiSpec;
    } catch (err) {
        throw err;
        // throw new Error("Configuration file generator-oapi-sequelize.json is missing. Create it as described in the documentation.");
    }
}

module.exports = { parser, getModels };