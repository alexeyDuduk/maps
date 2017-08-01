define([
    'esri/core/promiseUtils',
    'dojo/Deferred'
], (promiseUtils, Deferred) => {
    'use strict';

    return class PromiseUtils {
        static timeout(func, delay) {
            let deferred = new Deferred();
            let timeoutId = setTimeout(() => {
                try {
                    let result = func ? func() : null;
                    deferred.resolve(result);
                } catch (e) {
                    deferred.reject(e);
                } finally {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
            }, delay);

            return deferred;
        }

        static resolve(value) {
            return promiseUtils.resolve(value);
        }

        static reject(value) {
            return promiseUtils.reject(value);
        }

        static whenAll(promises) {
            return promiseUtils.eachAlways(promises)
                .then((results) => _.map(results, (result) => result.value));
        }
    };
});
