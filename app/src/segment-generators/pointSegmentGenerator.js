define([
    'app/utils/pointUtils',
    'app/vendor/simplify',
    'app/app.settings'
], (PointUtils, simplify, settings) => {
    'use strict';

    return class PointSegmentGenerator {
        constructor(points) {
            this._points = points;
            this._provider = _getIterator(points);
            this._initCoefficients();
            this._interpolatedPoints = this.getInterpolatedPointsSet(points.length);
            this._currentPoint = null;
            this._currentIndex = 0;
        }

        _initCoefficients() {
            this._scaleSegmentsCount = Math.ceil(
                settings.camera.SCALE_TARGET_POINTS_COUNT / this.getPointsCountInSegment()
            );
            this._pointsCountBefore = Math.ceil(
                this._scaleSegmentsCount * settings.camera.SCALE_TARGET_POINTS_RATIO
            );
            this._pointsCountAfter = this._scaleSegmentsCount - this._pointsCountBefore;
        }

        getSegment() {
            return [this._currentPoint];
        }

        moveToNext() {
            let next = this._provider.next();
            this._currentPoint = next.value;
            this._currentIndex++;

            return !next.done;
        }

        getInitialPoint() {
            return this._points[0];
        }

        getCurrentPoint() {
            return this._currentPoint;
        }

        getCurrentInterpolatedPoint() {
            // returns interpolated point
            // offset by initial buffer length
            return this._interpolatedPoints[this._pointsCountBefore + this.getCurrentPointIndex()];
        }

        // return array of interpolated points with a center
        // defined in the SCALE_TARGET_POINTS_RATIO parameter
        getCameraPoints() {
            return [this.getCurrentPoint()];
            let currentIndex = this.getCurrentPointIndex();

            return this._interpolatedPoints.slice(
                currentIndex,
                currentIndex + this._scaleSegmentsCount
            );
        }

        getCurrentPointIndex() {
            return this._currentIndex;
        }

        getPoints() {
            return this._points;
        }

        getPointsCountInSegment() {
            return 1;
        }

        getPointsSet(count) {
            return this._points.slice(0, count);
        }

        // return array of points for interpolated route
        // get array of points for interpolated route from 'simplify'
        // find common points
        // split interpolated path on the same number of points as original path
        // TODO: review the possibility of duplicated points, indexes can be incorrect in this case

        // TODO: camera specific logic
        getInterpolatedPointsSet(count) {
            let originalPoints = this._mapWithBufferPoints(this._points.slice(0, count));
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

    function _getIterator(array) {
        let index = -1;

        return {
            next: () => {
                index++;

                return {
                    value: array[index],
                    done: index >= array.length
                };
            }
        };
    }
});
