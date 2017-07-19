(function () {
    "use strict";

    require(['esri/core/promiseUtils'], (promiseUtils) => {
        class CachingDataProviderWrapper extends window.EM.BaseDataProvider {
            constructor(dataProvider) {
                super();
                this._dataProvider = dataProvider;
                this._points = null;
                this._locations = null;
            }

            getPoints() {
                return this._execute('getPoints', '_points');
            }

            getLocations() {
                return this._execute('getLocations', '_locations');
            }

            _execute(actionName, cachePath) {
                if (this[cachePath]) {
                    return promiseUtils.resolve(this[cachePath]);
                }
                else {
                    return this._dataProvider[actionName]()
                        .then((result) => this[cachePath] = result);
                }
            }
        }

        window.EM.CachingDataProviderWrapper = CachingDataProviderWrapper;
    });
})();