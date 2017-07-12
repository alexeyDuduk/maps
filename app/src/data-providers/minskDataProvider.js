(function () {
    "use strict";

    require(['esri/request'], (request) => {

        class MinskDataProvider {
            get() {
                return request('stubs/points/minsk-900.json', { responseType: 'json' })
                    .then((response) => _.map(response.data, (item) => [item[1], item[0]]));
            }
        }

        window.EM.MinskDataProvider = MinskDataProvider;
    });
})();