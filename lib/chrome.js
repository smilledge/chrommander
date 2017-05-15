const { ChromeLauncher } = require('lighthouse/lighthouse-cli/chrome-launcher');
const chrome = require('chrome-remote-interface');


const blockGroups = {
    styles: ['*.css'],
    scripts: ['*.js'],
    media: ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.svg', '*.mp4', '*.webm'],
    fonts: ['*.ttf', '*.otf', '*.woff', '*.woff2'],
};

blockGroups.assets = [].concat.apply([], Object.values(blockGroups));


function expandBlocks(blocks) {
    if (!Array.isArray(blocks)) {
        blocks = [blocks];
    }

    return blocks
        .map((block) => {
            if (blockGroups[block]) {
                return blockGroups[block];
            }
            return [block];
        })
        .reduce(function(a, b) {
            return a.concat(b);
        });
}


function launchChrome(options) {
    const launcher = new ChromeLauncher({
        port: options.port || 9222,
        autoSelectChrome: true,
        additionalFlags: [
            '--disable-gpu',
            '--headless'
        ]
    });

    return launcher.run()
        .then(() => launcher)
        .catch((err) => {
            // Kill Chrome if there's an error
            return launcher.kill().then(() => {
                throw err;
            }, console.error);
        });
}


function loadPage(url, options, done = () => {}) {

    if (options.block) {
        options.block = expandBlocks(options.block);
    }

    return chrome(client => {
        const { Page, Runtime, Network } = client;
        const startTime = new Date().getTime();
        const requestedUrls = [];
        var endTime;

        Promise.all([
            Page.enable(),
            Runtime.enable(),
            Network.enable()
        ]).then(() => {

            if (options.block) {
                Network.setBlockedURLs({
                    urls: options.block
                });
            }

            Network.responseReceived((data) => {
                var resUrl = data.response.url;

                if (resUrl.indexOf('data:') === 0) {
                    return;
                }

                requestedUrls.push(resUrl);
            });

            Page.navigate({
                url: url
            });

            return Page.loadEventFired(() => {
                options.onLoad({ Page, Runtime, Network }).then((result) => {
                    client.close();
                    const endTime = new Date().getTime();
                    done(null, {
                        startTime,
                        endTime,
                        totalTime: (endTime - startTime) / 1000,
                        totalRequests: requestedUrls.length,
                        requests: requestedUrls,
                        result: result
                    });
                });
            });
        });

    })
    .on('error', err => {
        done(new Error('Cannot connect to Chrome:' + err));
    });
}


function dumpDom({ Runtime }) {
    return Runtime.evaluate({
        expression: 'document.body.innerHTML'
    }).then(result => {
        return result.result.value;
    }).catch(() => '');
}


module.exports = {
    launch: launchChrome,
    load: loadPage,
    dump: dumpDom
};
