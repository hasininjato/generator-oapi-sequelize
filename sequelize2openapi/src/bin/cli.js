#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../../package.json');

program
    .version(pkg.version)
    .description(pkg.description)
    // Add your custom CLI options/flags
    .option('-i, --input <path>', 'Input path for processing')
    .option('-o, --output <path>', 'Output path for results', 'output.json')
    .option('--verbose', 'Show detailed logs')
    .parse(process.argv);

const options = program.opts();

// Your custom logic here
function runCustomTask(input, output, isVerbose) {
    if (isVerbose) console.log('Starting task...');

    // Replace this with your actual task
    console.log(`Processing ${input} → ${output}`);
    return Promise.resolve(); // Simulate async success
}

// Execute your custom logic
runCustomTask(options.input, options.output, options.verbose)
    .then(() => console.log('Done!'))
    .catch((err) => {
        console.error('Failed:', err.message);
        process.exit(1);
    });