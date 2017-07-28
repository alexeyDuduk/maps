require([
    'app/vendor/es6-collections',
    'app/app',
    'dojo/domReady!'
], (ES6, App) => {
    'use strict';

    let app = new App();
    app.run();
});
