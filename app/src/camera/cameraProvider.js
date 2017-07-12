(function () {
    "use strict";

    require([], () => {
        const DEFAULT_ZOOM = 13;

        class CameraProvider {
            constructor(segmentGenerator) {
                this._segmentGenerator = segmentGenerator;
                this._latSum = 0;
                this._lngSum = 0;
                this._count = 0;
                this._pointsToRemember = 20;
                this._pointsCache = [];
            }

            getInitialCamera() {
                let point = this._segmentGenerator.getInitialPoint();

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
                    this._forgetFirstPoint();
                }

                return {
                    target: this._pointsCache,
                    center: point.slice(0, 2),
                    tilt: 45,
                    heading: this._getHeading(point)
                };
            }

            getTotalViewCamera() {
                return {
                    target: this._segmentGenerator.getPoints(),
                    tilt: 30
                };
            }

            _rememberPoint(point) {
                this._pointsCache.push(point);
                this._latSum += point[0];
                this._lngSum += point[1];
                this._count++;
            }

            _forgetFirstPoint() {
                let point = this._pointsCache.shift();
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