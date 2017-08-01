define([
    'app/utils/pointUtils',
    'app/vendor/simplify'
], (PointUtils, simplify) => {
    'use strict';

    return class PointSegmentGenerator {
        constructor(points) {
            this._points = points;
            this._interpolatedPoints = this.getInterpolatedPointsSet(points.length);
            this._currentPoint = null;
            this._provider = _getIterator(points);
        }

        getSegment() {
            return [this._currentPoint];
        }

        moveToNext() {
            let next = this._provider.next();
            this._currentPoint = next.value;

            return !next.done;
        }

        getInitialPoint() {
            return this._points[0];
        }

        getCurrentPoint() {
            // return this._currentPoint;
            return this._interpolatedPoints[this.getCurrentPointIndex()];
        }

        getCurrentPointIndex() {
            return PointUtils.findPointIndex(this._currentPoint, this._points);
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

            points = simplify(points, 0.01, true);
            points = points.map(point => [point.x, point.y]);

            let filledPoints = points.reduce((result, point, index) => {
                if (!index) return result;
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
