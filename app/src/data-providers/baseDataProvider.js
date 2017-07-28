define(['esri/core/promiseUtils'], (promiseUtils) => {
    'use strict';

    return class BaseDataProvider {
        getPoints() {
            return promiseUtils.resolve([]);
        }

        getLocations() {
            return promiseUtils.resolve([]);
        }
    };
});