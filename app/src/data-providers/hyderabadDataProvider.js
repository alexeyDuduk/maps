(function () {
    "use strict";

    require(['esri/request'], (request) => {
        class HyderabadDataProvider {
            get() {
                return request('stubs/points/hyderabad-11.json', { responseType: 'json' })
                    .then((response) => _.map(response.data, (item) => [item.x, item.y]));
            }
        }

        window.EM.HyderabadDataProvider = HyderabadDataProvider;
    });
})();