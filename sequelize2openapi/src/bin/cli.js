#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../../package.json');
const main = require("../../index");
const path = require('path');
const fs = require('fs');
const configTemplate = require("./model");
const yaml = require('js-yaml');

program
    .version(pkg.version)
    .description(pkg.description)
    // Add your custom CLI options/flags
    .option('-m, --model <path>', 'Model name to process')
    .parse(process.argv);

const options = program.opts();

function runCustomTask(model) {
    return Promise.resolve();
}

// Execute your custom logic
runCustomTask(options.model)
    .then(() => {
        const projectRoot = process.cwd();
        const configPath = path.join(projectRoot, 'sequelize2openapi.json');
        const sequelizeConfig = require(configPath);

        const servicesPath = sequelizeConfig.servicesPath;
        const modelsPath = sequelizeConfig.modelsPath;
        const models = main.getModels(`${projectRoot}/${modelsPath}`);
        const modelFound = models.find((model) => model.sequelizeModel === options.model);
        if (!modelFound) {
            throw new Error(`Model ${options.model} not found`);
        }
        const modelPath = path.join(projectRoot, servicesPath, `${options.model.toLowerCase()}.yaml`);
        if (fs.existsSync(modelPath)) {
            console.error('Error: Config file already exists at', `${projectRoot}/${servicesPath}`);
            process.exit(1);
        }
        const dynamicConfig = {
            ...configTemplate(options.model) // Pass model name to template
        };
        const yamlString = yaml.dump(dynamicConfig, {
            lineWidth: -1, // No line wrapping
            noRefs: true   // Prevent anchor/ref generation
        });
        const outputPath = path.join(projectRoot, servicesPath, `${options.model.toLowerCase()}.yaml`);
        console.log(`Creating config file at ${outputPath}`);
        fs.writeFileSync(outputPath, yamlString);
    })
    .catch((err) => {
        console.error('Failed:', err);
        process.exit(1);
    });