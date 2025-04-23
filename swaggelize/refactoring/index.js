const {modelParser} = require('./src/parsers/modelParser');
const {getFileInDirectory, readFileContent} = require("./src/utils/utils");
const {serviceParser} = require('./src/parsers/serviceParser');
const fs = require("fs");
const parseInputOutput = require("./src/parsers/schemaParser");

function getModels(modelsPath, modelsFiles) {
    const models = []
    modelsFiles.forEach(file => {
        const code = readFileContent(`${modelsPath}/${file}`)
        models.push(...modelParser(code).filter(m => !Array.isArray(m)));
    })

    fs.writeFileSync("../swaggelize/json/models.json", JSON.stringify(models, null, 4));
    return models;
}

function getServiceParser(servicesPath, servicesFiles, routesVariable) {
    // Combining results from all service files
    let services = {
        "collectionOperations": {
            default: {},
            custom: {}
        },
        "itemOperations": {
            default: {},
            custom: {}
        }
    };
    let schemas = [];

    servicesFiles.forEach(file => {
        const content = readFileContent(`${servicesPath}/${file}`);
        const {collectionOperations, itemOperations} = serviceParser(content, routesVariable);
        schemas.push(...parseInputOutput(itemOperations));
        schemas.push(...parseInputOutput(collectionOperations));

        // Merge collectionOperations
        services.collectionOperations.default = {
            ...services.collectionOperations.default,
            ...(collectionOperations?.default || {})
        };
        services.collectionOperations.custom = {
            ...services.collectionOperations.custom,
            ...(collectionOperations?.custom || {})
        };

        // Merge itemOperations
        services.itemOperations.default = {
            ...services.itemOperations.default,
            ...(itemOperations?.default || {})
        };
        services.itemOperations.custom = {
            ...services.itemOperations.custom,
            ...(itemOperations?.custom || {})
        };
    });

    fs.writeFileSync("../swaggelize/json/services.json", JSON.stringify(services, null, 4));
    fs.writeFileSync("../swaggelize/json/schemas.json", JSON.stringify(schemas, null, 4));

    return {services, schemas};
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
    fs.writeFileSync("../swaggelize/json/test-models.json", JSON.stringify(models, null, 4));

    const servicesFiles = getFileInDirectory(servicesPath);
    const {services, schemas} = getServiceParser(servicesPath, servicesFiles, routesVariable);

    fs.writeFileSync("../swaggelize/json/test-services.json", JSON.stringify({services, schemas}, null, 4));
}

module.exports = parser;