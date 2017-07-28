define([
    'esri/request',
    'app/data-providers/baseDataProvider'
], (request, BaseDataProvider) => {
    'use strict';

    return class MinskDataProvider extends BaseDataProvider {
        getPoints() {
            return request('stubs/points/minsk-900.json', { responseType: 'json' })
                .then((response) => _.map(response.data, (item) => [item[1], item[0]]));
        }
    };
});