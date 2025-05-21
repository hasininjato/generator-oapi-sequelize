const { modelParser, addRelationManyToManyToEachModel, getAllMethods } = require('./src/parsers/modelParser');
const { getFileInDirectory, readFileContent, removeKeyDeep, addCommonErrorSchemas } = require("./src/utils/utils");
const serviceParser = require("./src/parsers/serviceParser");
const createParameters = require("./src/creators/parameterCreator");
const createSchemas = require('./src/creators/schemaCreator');
const createResponse = require('./src/creators/responseCreator');
const createRequestBody = require("./src/creators/requestBodyCreator");
const path = require('path');

function getModels(modelsPath) {
    return getFileInDirectory(modelsPath)
        .flatMap(file => modelParser(readFileContent(`${modelsPath}/${file}`)))
        .filter(model => !Array.isArray(model));
}

function parser(routesVariable) {
    try {
        const configPath = path.join(require.main.path, 'sequelize2openapi.json');
        const sequelizeConfig = require(configPath);

        const { servicesPath, modelsPath, routePrefix, openApiDefinition } = sequelizeConfig;

        // Load and process models
        const models = getModels(modelsPath);
        const modelNames = models.map(model => model.sequelizeModel);
        addRelationManyToManyToEachModel(models, modelNames);

        const methodsToProcess = getAllMethods(models);
        const schemas = createSchemas(models, methodsToProcess);
        addCommonErrorSchemas(schemas); // Add 400/409 schemas

        const openApiInfo = {
            openapi: openApiDefinition.openapi,
            info: openApiDefinition.info,
            servers: openApiDefinition.servers
        };

        const servicesFiles = getFileInDirectory(servicesPath);
        const services = {}; // Accumulate services here
        const components = {
            components: {
                parameters: createParameters(routesVariable),
                schemas
            }
        };

        // Process each service file and update paths
        servicesFiles.forEach(file => {
            const content = readFileContent(`${servicesPath}/${file}`);
            const currentService = serviceParser(content, routesVariable, routePrefix);

            Object.assign(services, currentService);

            createRequestBody(currentService, schemas, models, modelNames, components);
            createResponse(currentService, schemas, models, modelNames);
        });

        let openApiSpec = {
            ...openApiInfo,
            ...components,
            paths: services
        };

        // Clean up internal-use-only keys
        const internalKeys = ["input", "output", "isCreation", "customPath", "model", "filterableFields"];
        internalKeys.forEach(key => {
            openApiSpec = removeKeyDeep(openApiSpec, key);
        });

        return openApiSpec;

    } catch (err) {
        throw new Error("Failed to generate OpenAPI spec. Make sure 'sequelize2openapi.json' exists and is properly configured.");
    }
}

module.exports = { parser, getModels };
