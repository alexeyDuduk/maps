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
        access: {
            server: 'https://route.arcgis.com/arcgis/rest/services',
            token: '6eG3-sLUxNSiQ3fFAF2Qz3EQAxqk1Goj0A256oExXafSkTuSmVdopD1odgoKBJ5R_dGY9SPb1WeipLMK5FTpgaS2T0bBK6QfalbqEmEr7LEPjUmLtisDSm-0H9zeAyiZfuSRtSR0DHSGvh7vpRU7Gg..'
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
