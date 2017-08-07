var page = require('webpage').create();

var rendering = false;

var startRender = function (interval) {
    setInterval(function() {
        page.render('/dev/stdout', { format: "png" });
    }, interval);
};

var screenshot = function (delay) {
    setTimeout(function () {
        page.render('screenshot.png', { format: "png" });
        console.log('screenshot');
    }, delay);
};

var render = function () {
    if (rendering) {
        page.render('/dev/stdout', { format: "png" });
    }
};

var onConsoleMessage = function (message) {
    switch (message) {
        case 'phantom:start':
            rendering = true;
            // startRender(200);
            // screenshot(3000);
            // console.log(message);
            break;
        case 'phantom:end':
            rendering = false;
            phantom.exit();
            break;
        case 'phantom:render':
            render();
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
