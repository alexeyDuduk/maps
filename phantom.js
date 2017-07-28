var page = require('webpage').create();

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

var onConsoleMessage = function (message) {
    switch (message) {
        case 'phantom:start':
            startRender(400);
            // screenshot(3000);
            // console.log(message);
            break;
        case 'phantom:finish':
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
