(function () {
    "use strict";

    require([], () => {
        const DEFAULT_ZOOM = 16;

        class CameraProvider {
            constructor(points) {
                this._points = points;
                this._latSum = 0;
                this._lngSum = 0;
                this._count = 0;
                this._pointsToRemember = Math.floor(points.length / 5);

                //_.each(points.slice(0, 5), (point) => this._rememberPoint(point));
            }

            getInitialCamera() {
                let point = this._points[0];

                return {
                    center: point.slice(0, 2),
                    zoom: DEFAULT_ZOOM,
                    tilt: 0,
                    heading: this._getHeading(point)
                };
            }

            getCamera(point) {
                this._rememberPoint(point);
                if (this._count > this._pointsToRemember) {
                    this._forgetPoint(this._points[this._count - this._pointsToRemember - 1]);
                }

                return {
                    center: point.slice(0, 2),
                    zoom: DEFAULT_ZOOM,
                    tilt: 45,
                    heading: this._getHeading(point)
                };
            }

            getTotalViewCamera() {
                return {
                    target: this._points,
                    tilt: 30
                };
            }

            _rememberPoint(point) {
                this._latSum += point[0];
                this._lngSum += point[1];
                this._count++;
            }

            _forgetPoint(point) {
                this._latSum -= point[0];
                this._lngSum -= point[1];
                this._count--;
            }

            _getHeading(point) {
                let averagePoint = [ this._latSum / this._count, this._lngSum / this._count ];
                let heading = 0;
                if (this._count > 2) {
                    let dy = averagePoint[1] - point[1];
                    let dx = averagePoint[0] - point[0];
                    let tg = dx / dy;
                    heading = Math.atan(tg) * 180 / Math.PI;
                    if (dy < 0) {
                        heading += 180;
                    } else if (dx < 0) {
                        heading += 360;
                    }
                }

                return heading;
            }
        }

        window.EM.CameraProvider = CameraProvider;
    });
})();