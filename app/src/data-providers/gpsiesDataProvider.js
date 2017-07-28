define([
    'esri/request',
    'app/data-providers/baseDataProvider'
], (request, BaseDataProvider) => {
    'use strict';

     return class GpsiesDataProvider extends BaseDataProvider{
        constructor(name) {
            super();
            this._name = name;
        }

        getPoints() {
            return request(`stubs/points/${this._name}.json`, { responseType: 'json' })
                .then((response) => _.map(response.data, (item) => [item.lon, item.lat]));
        }
    };
});