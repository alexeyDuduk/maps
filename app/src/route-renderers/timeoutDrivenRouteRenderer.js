(function () {
    "use strict";

    require([], () => {
        const settings = window.EM.settings.camera;

        class TimeoutDrivenRouteRenderer {
            constructor(segmentRenderer) {
                this._segmentRenderer = segmentRenderer;
            }

            draw(segmentGenerator) {
                let intervalId = setInterval(function () {
                    try {
                        if (!segmentGenerator.moveToNext()) {
                            clearInterval(intervalId);
                            intervalId = null;
                            return;
                        }
                        this._segmentRenderer.addPath(segmentGenerator.getSegment());
                    }
                    catch (e) {
                        console.log(e);
                    }
                }, settings.FRAME_DURATION);
            }
        }

        window.EM.TimeoutDrivenRouteRenderer = TimeoutDrivenRouteRenderer;
    });
})();