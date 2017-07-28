define([
    'esri/request',
    'app/app.settings',
    'app/data-providers/baseDataProvider'
], (request, settings, BaseDataProvider) => {
    'use strict';

    return class ProdDataProvider extends BaseDataProvider {
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
                        type: settings.locations[_.toUpper(item.type.value || 'none')],
                        displayName: item.name,
                        id: index
                    }))
                )
                .otherwise((result) => console.log('prod data provider -> otherwise', result));
        }
    };
});