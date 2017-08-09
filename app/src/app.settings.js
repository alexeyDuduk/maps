define(() => {
    'use strict';

    const ASSETS_PATH = '/assets/';

    const defaultIconSizes = {
        verticalOffset: {
            screenLength: 150,
            maxWorldLength: 5000,
            minWorldLength: 50
        },
        symbolSize: 25,
        calloutSize: 4
    };
    const brandPrimaryColor = [ 30, 136, 229 ];

    return {
        DEBUG: true,
        access: {
            server: 'https://route.arcgis.com/arcgis/rest/services',
            token: 'T3Wcd7yGjyhbt-b8OLiYoHdTDH105qRfq8xwHFyOeOha4AowmLHTykWIlBcLxBC650OfeDq5qdrBFk5U3pMV94J6isHrHDGz9Rbtroovc6ESsUdV9uYUCqBaaDdtpVHV-vA9r4BxCC71ccB14HllwA..'
        },
        locations: {
            PICKUP: 'PICKUP',
            DELIVERY: 'DELIVERY',
            INTERMEDIATE: 'INTERMEDIATE'
        },
        camera: {
            // position
            DEFAULT_ZOOM: 11,
            INITIAL_TILT: 0,
            ROUTE_TILT: 55,
            TOTAL_VIEW_TILT: 30,
            FOV: 55,
            // points grouping
            HEADING_TARGET_POINTS_COUNT: 50,
            SCALE_TARGET_POINTS_COUNT: 60,
            SCALE_TARGET_POINTS_RATIO: 0.4,
            POINTS_COUNT_PER_CAMERA_POSITION: 1,
            INTERPOLATION_PRECISION: 0.05,
            // animation duration
            INITIAL_TRANSITION_DURATION: 800,
            TOTAL_VIEW_TRANSITION_DURATION: 1200
        },
        route: {
            MAX_POINTS_COUNT: 500
        },
        colors: {
            BRAND_PRIMARY: brandPrimaryColor,
            LOCATIONS: {
                NONE: [ 30, 136, 229 ],
                //PICKUP: [ 61, 224, 61 ],
                //DELIVERY: [ 187, 0, 0 ],
                //INTERMEDIATE: [176, 236, 255]
            }
        },
        routeBuilder: {
            URL: 'https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World',
            MAX_POINTS_COUNT: 140,  // api limitation
            POINTS_PERCENT_TO_PROCESS: 50,
            MIN_POINTS_COUNT: 2
        },
        assets: {
            LOCATION_PIN: {
                PICKUP: _assetsPrefixed('svg/location-pin-pickup.svg'),
                DELIVERY: _assetsPrefixed('svg/location-pin-delivery.svg'),
                INTERMEDIATE: _assetsPrefixed('svg/location-pin-intermediate.svg')
            }
        },
        iconSizes: {
            PICKUP: defaultIconSizes,
            DELIVERY: defaultIconSizes,
            INTERMEDIATE: {
                verticalOffset: {
                    screenLength: 30,
                    maxWorldLength: 2000,
                    minWorldLength: 20
                },
                symbolSize: 25,
                calloutSize: 1
            }
        }
    };

    function _assetsPrefixed(path) {
        return `${ASSETS_PATH}${path}`;
    }
});
