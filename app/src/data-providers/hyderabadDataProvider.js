(function () {
    "use strict";

    require(['esri/request'], (request) => {
        class HyderabadDataProvider extends window.EM.BaseDataProvider {
            getPoints() {
                return request('stubs/points/hyderabad-11.json', { responseType: 'json' })
                    .then((response) => _.map(response.data, (item) => [item.x, item.y]));
            }
        }

        window.EM.HyderabadDataProvider = HyderabadDataProvider;
    });
})();