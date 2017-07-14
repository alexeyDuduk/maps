(function () {
    "use strict";

    function createSettings() {
        const ASSETS_PATH = '/assets/';

        return {
            camera: {
                DEFAULT_ZOOM: 14,
                INITIAL_TILT: 0,
                ROUTE_TILT: 55,
                TOTAL_VIEW_TILT: 30,
                HEADING_TARGET_POINTS_COUNT: 20,
                SCALE_TARGET_POINTS_COUNT: 10,
                POINTS_COUNT_PER_CAMERA_POSITION: 4,
                SPEED_FACTOR: 1,
                INITIAL_TRANSITION_DURATION: 4000,
                FRAME_DURATION: 100,
                TOTAL_VIEW_TRANSITION_DURATION: 4000
            },
            route: {
                MAX_POINTS_COUNT: 2000
            },
            colors: {
                BRAND_PRIMARY: [ 30, 136, 229 ],
                LOCATIONS: {
                    none: [ 30, 136, 229 ],
                    pickup: [ 61, 224, 61 ],
                    delivery: [ 187, 0, 0 ]
                }
            },
            routeBuilder: {
                URL: 'https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World',
                MAX_POINTS_COUNT: 150,  // api limitation
                POINTS_PERCENT_TO_PROCESS: 50,
                MIN_POINTS_COUNT: 2
            },
            assets: {
                LOCATION_PIN: _assetsPrefixed('svg/Filled Location Pin.svg')
            }
        };

        function _assetsPrefixed(path) {
            return ASSETS_PATH + path;
        }
    }

    window.EM.settings = createSettings();
})();