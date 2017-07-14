(function () {
    "use strict";

    require(['esri/request'], (request) => {
        class GpsiesDataProvider extends window.EM.BaseDataProvider{
            constructor(name) {
                super();
                this._name = name;
            }

            getPoints() {
                return request(`stubs/points/${this._name}.json`, { responseType: 'json' })
                    .then((response) => _.map(response.data, (item) => [item.lon, item.lat]));
            }
        }

        window.EM.GpsiesDataProvider = GpsiesDataProvider;
    });
})();