(function () {
    "use strict";

    require(['esri/request'], (request) => {
        class ProdDataProvider {
            constructor(name) {
                this._name = name;
            }

            get() {
                return request(`stubs/points/${this._name}.json`, { responseType: 'json' })
                    .then((response) => _.map(response.data.data, (item) => item.address.gps.coordinates));
            }
        }

        window.EM.ProdDataProvider = ProdDataProvider;
    });
})();