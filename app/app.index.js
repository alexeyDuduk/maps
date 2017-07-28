require([
    'app/app',
    'dojo/domReady!'
], (App) => {
    'use strict';

    let app = new App();
    app.run();
});