(function() {
    "use strict";

    class Es6DojoPromiseAdapter {
        constructor(es6Promise) {
            this._promise = es6Promise;
        }

        then(callback) {
            return new Es6DojoPromiseAdapter(this._promise.then(callback));
        }

        otherwise(callback) {
            return new Es6DojoPromiseAdapter(this._promise.catch(callback));
        }
    }

    window.EM.Es6DojoPromiseAdapter = Es6DojoPromiseAdapter;
})();