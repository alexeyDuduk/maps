define([
    'esri/request',
    'app/data-providers/baseDataProvider'
], (request, BaseDataProvider) => {
    'use strict';

    return class HyderabadDataProvider extends BaseDataProvider {
        getPoints() {
            return request('stubs/points/hyderabad-11.json', { responseType: 'json' })
                .then((response) => _.map(response.data, (item) => [item.x, item.y]));
        }
    };
});