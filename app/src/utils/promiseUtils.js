define([
    'esri/core/promiseUtils',
    'dojo/Deferred',
    'app/app.settings'
], (promiseUtils, Deferred, settings) => {
    'use strict';

    const _isPromise = (obj) => obj && obj.then && obj.otherwise;

    class VerbosePromise {
        constructor(promise) {
            this._promise = promise;
        }

        then(func) {
            return new VerbosePromise(this._promise.then(
                this._createHandle(func, (res) => promiseUtils.resolve(res))
            ));
        }

        otherwise(func) {
            return new VerbosePromise(this._promise.otherwise(
                this._createHandle(func, (res) => promiseUtils.reject(res))
            ));
        }

        _createHandle(func, action) {
            return function () {
                try {
                    if (!func) {
                        return action();
                    }
                    let result = func.apply(null, arguments);

                    return _isPromise(result) ? result : action(result);
                }
                catch (e) {
                    console.error(e);
                    return promiseUtils.reject(e);
                }
            };
        }
    }

    return class PromiseUtils {
        static timeout(func, delay) {
            let deferred = new Deferred();
            let timeoutId = setTimeout(() => {
                try {
                    let result = func ? func() : null;
                    deferred.resolve(result);
                } catch (e) {
                    console.error(e);
                    deferred.reject(e);
                } finally {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
            }, delay);

            return deferred;
        }

        static resolve(value) {
            return PromiseUtils.wrap(promiseUtils.resolve(value));
        }

        static reject(value) {
            return PromiseUtils.wrap(promiseUtils.reject(value));
        }

        static whenAll(data) {
            let promises = _.map(data, (obj) => {
                if (!_isPromise(obj)) {
                    return PromiseUtils.resolve(obj);
                }
                return obj;
            });

            return PromiseUtils.wrap(
                promiseUtils.eachAlways(promises)
                    .then((results) => _.map(results, (result) => result.value))
            );
        }

        static wrap(promise) {
            return settings.DEBUG ? new VerbosePromise(promise) : promise;
        }
    };
});
