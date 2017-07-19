(function () {
    "use strict";

    require(['esri/request'], (request) => {
        const locations = window.EM.settings.locations;

        class ProdDataProvider extends window.EM.BaseDataProvider {
            constructor(name) {
                super();
                this._name = name;
            }

            getPoints() {
                return request(`stubs/points/${this._name}.json`, { responseType: 'json' })
                    .then((response) => _.map(response.data.data, (item) => item.address.gps.coordinates));
            }

            getLocations() {
                return request(`stubs/locations/${this._name}.json`, { responseType: 'json' })
                    .then((response) => _.map(response.data, (item, index) => ({
                            geometry: item.location.address.gps.coordinates,
                            type: locations[_.toUpper(item.type.value || 'none')],
                            displayName: item.name,
                            id: index
                        }))
                    )
                    .otherwise((result) => console.log('prod data provider -> otherwise', result));
            }
        }

        window.EM.ProdDataProvider = ProdDataProvider;
    });
})();