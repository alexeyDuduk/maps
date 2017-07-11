(function () {
    "use strict";

    require([], () => {
        const DEFAULT_ZOOM = 18;

        class CameraProvider {
            constructor(points) {
                this._points = points;
                this._latSum = 0;
                this._lngSum = 0;
                this._count = 0;
            }

            getInitialViewCamera() {
                return {
                    position: this._points[0].slice(0, 2).concat([4000]),
                    tilt: 0
                };
            }

            getInitialCamera() {
                return {
                    center: this._points[0].slice(0, 2),
                    zoom: DEFAULT_ZOOM,
                    tilt: 0
                };
            }

            getCamera(point) {
                this._latSum += point[0];
                this._lngSum += point[1];
                this._count++;

                let averagePoint = [ this._latSum / this._count, this._lngSum / this._count ];
                let heading = 0;
                if (this._count > 2) {
                    let dy = point[1] - averagePoint[1];
                    let dx = point[0] - averagePoint[0];
                    let tg = dx / dy;
                    heading = Math.atan(tg) * 180 / Math.PI;
                    if (dy < 0) {
                        heading += 180 * (dx > 0 ? 1 : -1);
                    }
                }

                return {
                    center: point.slice(0, 2),
                    zoom: DEFAULT_ZOOM,
                    tilt: 45,
                    heading: heading
                };
            }

            getTotalViewCamera() {
                return {
                    target: this._points,
                    tilt: 30
                };
            }
        }

        window.EM.CameraProvider = CameraProvider;
    });
})();