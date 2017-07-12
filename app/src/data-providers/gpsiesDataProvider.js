(function () {
    "use strict";

    require(['esri/request'], (request) => {
        class GpsiesDataProvider {
            constructor(name) {
                this._name = name;
            }

            get() {
                return request(`stubs/points/${this._name}.json`, { responseType: 'json' })
                    .then((response) => _.map(response.data, (item) => [item.lon, item.lat]));
            }
        }

        window.EM.GpsiesDataProvider = GpsiesDataProvider;
    });
})();