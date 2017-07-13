(function () {
    "use strict";

    function createSettings() {
        const speedFactor = 1;

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
                FRAME_DURATION: 10,
                TOTAL_VIEW_TRANSITION_DURATION: 4000
            },
            route: {
                MAX_POINTS_COUNT: 2000
            }
        };
    }

    window.EM.settings = createSettings();
})();