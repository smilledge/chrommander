#!/usr/bin/env node
const optimist = require('optimist');
const server = require('../lib/server');

var args = optimist
    .alias('h', 'help')
    .alias('h', '?')
    .options('chrome-port', {
        string: true,
        describe: 'The port to run Chrome on',
        default: 9222
    })
    .options('port', {
        alias: 'p',
        string: true,
        describe: 'The port to run the server on',
        default: 8090
    })
    .argv;


if (args.help) {
    optimist.showHelp();
    return process.exit(-1);
}

// Start the server
server.start(args);
