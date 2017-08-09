define([
    'app/vendor/simplify',
    'app/app.settings',
    'app/utils/pointUtils',
    'app/camera/baseHeadingStrategy',
], (simplify, settings, PointUtils, BaseHeadingStrategy) => {
    'use strict';

    return class CameraProvider {
        constructor(segmentGenerator, specialPoints) {
            // TODO
            this._headingStrategy = new BaseHeadingStrategy(segmentGenerator);
            this._segmentGenerator = segmentGenerator;

            this._initCoefficients();
            this._interpolatedPoints = this.getInterpolatedPointsSet();

            this._epsilon = 0.3;
            this._specialPoints = this._getSpecialPoints(specialPoints);
            this._lastMinRatio = Infinity;
            this._prevPoint = null;
            this._nextPoint = null;


            this._initZoom();
        }

        _initCoefficients() {
            this._scaleSegmentsCount = Math.ceil(
                settings.camera.SCALE_TARGET_POINTS_COUNT / this._segmentGenerator.getPointsCountInSegment()
            );
            this._pointsCountBefore = Math.ceil(
                this._scaleSegmentsCount * settings.camera.SCALE_TARGET_POINTS_RATIO
            );
            this._pointsCountAfter = this._scaleSegmentsCount - this._pointsCountBefore;
        }

        getInitialCamera() {
            let point = this._segmentGenerator.getInitialPoint();

            return {
                center: point,
                zoom: this._getZoomLevel(point),
                tilt: settings.camera.INITIAL_TILT,
                heading: this._headingStrategy.getInitialHeading(point)
            };
        }

        getCamera() {
            let point = this._interpolatedPoints[this._segmentGenerator.getCurrentPointIndex() + this._pointsCountBefore];
            this._headingStrategy.update(point);

            return {
                target: point,
                zoom: this._getZoomLevel(point),
                tilt: settings.camera.ROUTE_TILT,
                fov: settings.camera.FOV,
                heading: this._headingStrategy.getRouteHeading(point)
            };
        }

        getTotalViewCamera() {
            return {
                target: this._segmentGenerator.getPoints(),
                tilt: settings.camera.TOTAL_VIEW_TILT
            };
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

        // TODO: utils
        _getDistance(point1, point2) {
            return Math.sqrt(
                Math.pow(point1[0] - point2[0], 2) +
                Math.pow(point1[1] - point2[1], 2)
            );
        }

        // return array of points for interpolated route
        // get array of points for interpolated route from 'simplify'
        // find common points
        // split interpolated path on the same number of points as original path
        // TODO: review the possibility of duplicated points, indexes can be incorrect in this case
        // TODO: camera specific logic
        getInterpolatedPointsSet(count) {
            let originalPoints = this._mapWithBufferPoints(
                this._segmentGenerator.getPoints().slice(0, count)
            );
            let points = originalPoints.map(pair => ({ x: pair[0], y: pair[1] }));

            points = simplify(points, settings.camera.INTERPOLATION_PRECISION, true);
            points = points.map(point => [point.x, point.y]);

            let filledPoints = points.reduce((result, point, index) => {
                if (!index) {
                    return result;
                }
                let count = PointUtils.findPointIndex(point, originalPoints) - result.length;
                return result.concat(PointUtils.fillWithIntermediatePoints([points[index - 1], point], count));
            }, []);

            return filledPoints;
        }

        _mapWithBufferPoints(points) {
            // Add 2 buffers of points: before the first and after the last
            return _.concat(
                this._reflectPoints(points.slice(0, this._pointsCountBefore), _.first(points)),
                points,
                this._reflectPoints(points.slice(-this._pointsCountAfter), _.last(points))
            );
        }

        _reflectPoints(points, origin) {
            return _.chain(points)
                .map((point) => [
                    2 * origin[0] - point[0],
                    2 * origin[1] - point[1]
                ])
                .value()
                .reverse();
        }
    };
});
