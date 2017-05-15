const express = require('express')
const chrome = require('./chrome');

const app = express()
var launcher = null;

function exitHandler(err) {
    console.error('Error starting Chome');
    console.error(err);

    launcher.kill().then(() => {
        process.exit(-1);
    });
}

app.get('/dom', function(req, res) {

    const options = {
        url: req.query.url,
        onLoad: chrome.dump,
        block: req.query.block && req.query.block.split(',')
    };

    if (!options.url) {
        res.status(400).json({
            success: false,
            error: 'URL argument missing'
        });
        return;
    }

    chrome.load(req.query.url, options, (err, result) => {
        if (err) {
            res.json({
                success: false,
                error: err.message
            });
        } else {
            result.success = true;
            res.json(result);
        }
    });
});

function start(config) {
    chrome.launch({
        port: config['chrome-port']
    }).then(_launcher => {
        launcher = _launcher;

        app.listen(config.port, function () {
            console.log('Server listening on port ' + config.port);
        });

        process.on('SIGINT', exitHandler);
        process.on('unhandledRejection', exitHandler);
        process.on('rejectionHandled', exitHandler);
        process.on('uncaughtException', exitHandler);
    }).catch(exitHandler);
}

module.exports = { start }
