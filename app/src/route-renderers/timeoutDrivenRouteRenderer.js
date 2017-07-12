(function () {
    "use strict";

    require([], () => {
        class TimeoutDrivenRouteRenderer {
            constructor(segmentRenderer) {
                this._segmentRenderer = segmentRenderer;
            }

            draw(segmentGenerator, delay) {
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
                }, delay);
            }
        }

        window.EM.TimeoutDrivenRouteRenderer = TimeoutDrivenRouteRenderer;
    });
})();