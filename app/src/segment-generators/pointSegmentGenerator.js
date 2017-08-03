define([
    'app/utils/pointUtils',
    'app/vendor/simplify',
    'app/app.settings'
], (PointUtils, simplify, settings) => {
    'use strict';

    return class PointSegmentGenerator {
        constructor(points) {
            this._points = points;
            this._interpolatedPoints = this.getInterpolatedPointsSet(points.length);
            this._currentPoint = null;
            this._currentIndex = -1;
            this._provider = _getIterator(points);
            this._scaleSegmentsCount = Math.ceil(
                settings.camera.SCALE_TARGET_POINTS_COUNT / this.getPointsCountInSegment()
            );
            this._pointsCountBefore = Math.ceil(this._scaleSegmentsCount * settings.camera.SCALE_TARGET_POINTS_RATIO);
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
            // return this._currentPoint;
            return this._interpolatedPoints[this.getCurrentPointIndex()];
        }

        getCameraPoints() {
            let currentIndex = this.getCurrentPointIndex();

            if (currentIndex - this._pointsCountBefore < 0) {
                return this._interpolatedPoints.slice(0, this._scaleSegmentsCount);
            } else if (currentIndex + this._pointsCountAfter > this._interpolatedPoints.length) {
                return this._interpolatedPoints.slice(this._interpolatedPoints.length - this._scaleSegmentsCount);
            } else {
                return this._interpolatedPoints.slice(currentIndex - this._pointsCountBefore, currentIndex + this._pointsCountAfter);
            }
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

        getInterpolatedPointsSet(count) {
            let originalPoints = this._points.slice(0, count);
            let points = originalPoints.map(pair => ({ x: pair[0], y: pair[1] }));
            let result = [];

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
