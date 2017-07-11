(function () {
    "use strict";

    require([], () => {
        class TimeoutDrivenRouteRenderer {
            constructor(segmentRenderer) {
                this._segmentRenderer = segmentRenderer;
            }

            draw(points, delay) {
                let pointsProvider = points[Symbol.iterator]();
                let intervalId = setInterval(function () {
                    try {
                        let { value: point } = pointsProvider.next();

                        if (!point) {
                            clearInterval(intervalId);
                            intervalId = null;
                            return;
                        }
                        this._segmentRenderer.addPoint(point);
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