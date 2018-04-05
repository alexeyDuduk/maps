define([
    'esri/request',
    'app/app.settings',
    'app/data-providers/baseDataProvider',
    'app/utils/promiseUtils'
], (request, settings, BaseDataProvider, PromiseUtils) => {
    'use strict';

    return class LocationUpdatesDataProvider extends BaseDataProvider {
        constructor(name) {
            super();
            this._name = name;
            this._pointsCount = 20;
        }

        getPoints() {
            return PromiseUtils.wrap(request(`stubs/points/${this._name}.json`, { responseType: 'json' }))
                .then((response) => {
                // TODO !!!
                    _.first(response.data.data).internalType = settings.locations.INTERMEDIATE;
                    _.last(response.data.data).internalType = settings.locations.INTERMEDIATE;

                    return _.map(response.data.data, (item, index, arr) => {
                        let type = this._getExtertnalType(item);
                        let pointType = settings.locations.NONE;
                        let prev = arr[index - 1];
                        if (prev) {
                            let prevType = this._getExtertnalType(prev);
                            if (prevType !== 'at pickup' && prevType !== 'picked up' && (
                                type === 'at pickup' || type === 'picked up'
                                )) {
                                pointType = settings.locations.PICKUP;
                            }
                        }

                        return {
                            geometry: item.address.gps.coordinates,
                            type: item.internalType || pointType,
                            displayName: item.address.line1,
                            id: index
                        };
                    });
                });
        }

        _getExtertnalType (point) {
            return _.toLower(point.status.value);
        }

        extractLocations(points) {
            return _.filter(points, (point) => point.type);
        }

        getLocations() {
            return this.getPoints()
                .then((points) => {
                    let nth = Math.floor(points.length / (this._pointsCount - 1));

                    return _.chain(points)
                        .filter((point, index) => index % nth === 0)
                        .concat(_.last(points))
                        .map((point, index) => {
                            let type = 'pickup';

                            return {
                                geometry: point,
                                type: settings.locations[_.toUpper(type || 'none')],
                                displayName: 'Name',
                                id: index
                            };
                        })
                        .value();
                });

            // return request(`stubs/locations/${this._name}.json`, { responseType: 'json' })
            //     .then((response) => _.map(response.data, (item, index) => ({
            //             geometry: item.location.address.gps.coordinates,
            //             type: settings.locations[_.toUpper(item.type.value || 'none')],
            //             displayName: item.name,
            //             id: index
            //         }))
            //     )
            //     .otherwise((result) => console.log('prod data provider -> otherwise', result));
        }
    };
});
