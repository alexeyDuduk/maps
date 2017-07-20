require([
    'esri/core/promiseUtils'
], (promiseUtils) => {
    "use strict";

    const EM = window.EM;

    class PromiseUtils {
        static timeout(func, delay) {
            let promise = new Promise((resolve, reject) => {
                let timeoutId = setTimeout(() => {
                    try {
                        let result = func();
                        resolve(result);
                    } catch (e) {
                        reject(e);
                    } finally {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }
                }, delay);
            });

            return new EM.Es6DojoPromiseAdapter(promise);
        }

        static defer() {
            let deferred = {};
            let promise = new Promise((resolve, reject) => {
                deferred.resolve = resolve;
                deferred.reject = reject;
            });
            deferred.promise = new EM.Es6DojoPromiseAdapter(promise);

            return deferred;
        }

        static resolve(value) {
            return promiseUtils.resolve(value);
        }

        static reject(value) {
            return promiseUtils.reject(value);
        }
    }

    window.EM.PromiseUtils = PromiseUtils;
});