#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../../package.json');
const main = require("../../index");
const path = require('path');
const fs = require('fs');

program
    .version(pkg.version)
    .description(pkg.description)
    // Add your custom CLI options/flags
    .option('-m, --model <path>', 'Model name to process')
    .parse(process.argv);

const options = program.opts();

function runCustomTask(model) {
    console.log(`Processing ${model}`);
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
        console.log(main.getModels(`${projectRoot}/${modelsPath}`));
    })
    .catch((err) => {
        console.error('Failed:', err);
        process.exit(1);
    });