(function () {
    "use strict";

    require(['esri/core/promiseUtils'], (promiseUtils) => {
        class BaseDataProvider {
            getPoints() {
                return promiseUtils.resolve([]);
            }

            getLocations() {
                return promiseUtils.resolve([]);
            }
        }

        window.EM.BaseDataProvider = BaseDataProvider;
    });
})();