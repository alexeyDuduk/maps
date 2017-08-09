define([
    'app/app.settings'
], (settings) => {
    'use strict';

    return class CameraProvider {
        constructor(segmentGenerator, specialPoints) {
            this._segmentGenerator = segmentGenerator;
            this._latSum = 0;
            this._lngSum = 0;
            this._count = 0;
            // TODO:
            this._segmentsToRemember = Math.ceil(
                settings.camera.HEADING_TARGET_POINTS_COUNT / segmentGenerator.getPointsCountInSegment()
            );
            this._scaleSegmentsCount = Math.ceil(
                settings.camera.SCALE_TARGET_POINTS_COUNT / segmentGenerator.getPointsCountInSegment()
            );

            this._epsilon = 0.3;
            this._specialPoints = this._getSpecialPoints(specialPoints);
            this._lastMinRatio = Infinity;
            this._prevPoint = null;
            this._nextPoint = null;

            this._initZoom();
        }

        getInitialCamera() {
            let point = this._segmentGenerator.getInitialPoint();

            return {
                center: point,
                zoom: this._getZoomLevel(point),
                tilt: settings.camera.INITIAL_TILT,
                heading: this._getHeading(point)
            };
        }

        getCamera(point) {
            return {
                target: this._segmentGenerator.getCameraPoints(),
                zoom: this._getZoomLevel(point),
                tilt: settings.camera.ROUTE_TILT,
                fov: settings.camera.FOV,
                heading: this._getHeading(point) + 90
            };
        }

        getTotalViewCamera() {
            return {
                target: this._segmentGenerator.getPoints(),
                tilt: settings.camera.TOTAL_VIEW_TILT
            };
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

        _getSpecialPoints(points) {
            if (!points) {
                return [];
            }

            let result = points.slice();
            _.first(result).visited = true;

            return result;
        }

        _initZoom() {
            this._prevPoint = this._specialPoints[0];
            this._nextPoint = this._specialPoints[1];
            this._nextPointIndex = 1;
        }

        _getZoomLevel(currentPoint) {
            let maxZoom = 13;
            let minZoom = settings.camera.DEFAULT_ZOOM;

            if (!this._specialPoints.length) {
                return minZoom;
            }

            let totalDistance = this._getDistance(this._prevPoint.geometry, this._nextPoint.geometry);
            if (!totalDistance) {
                return minZoom;
            }
            let distanceToPrev = this._getDistance(this._prevPoint.geometry, currentPoint);
            let distanceToNext = this._getDistance(currentPoint, this._nextPoint.geometry);

            let distance = Math.min(distanceToPrev, distanceToNext);
            let ratio = distance / totalDistance;
            if (ratio > this._epsilon) {
                return minZoom;
            }

            if (ratio < this._lastMinRatio) {
                this._lastMinRatio = ratio;
            }
            else if (distanceToPrev > distanceToNext) {
                this._lastMinRatio = Infinity;
                this._nextPoint.visited = true;
                this._prevPoint = this._nextPoint;
                this._nextPoint = this._specialPoints[++this._nextPointIndex];
            }

            return maxZoom + ratio / this._epsilon * (minZoom - maxZoom);
        }

        _getDistance(point1, point2) {
            return Math.sqrt(
                Math.pow(point1[0] - point2[0], 2) +
                Math.pow(point1[1] - point2[1], 2)
            );
        }
    };
});
