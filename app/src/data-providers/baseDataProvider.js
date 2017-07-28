define(['app/utils/promiseUtils'], (PromiseUtils) => {
    'use strict';

    return class BaseDataProvider {
        getPoints() {
            return PromiseUtils.resolve([]);
        }

        getLocations() {
            return PromiseUtils.resolve([]);
        }
    };
});