var page = require('webpage').create();

var startRender = function (interval) {
    setInterval(function() {
        page.render('/dev/stdout', { format: "png" });
    }, interval);
};

var onConsoleMessage = function (message) {
    switch (message) {
        case 'phantom:start':
            startRender(400);
            break;
        case 'phantom:end':
            phantom.exit();
            break;
        default:
            // console.log(message);
            return;
    }
};

page.viewportSize = { width: 1280, height: 720 };

page.onConsoleMessage = onConsoleMessage;

page.open('http://0.0.0.0:3003', function () {
    // phantom.exit();
});
