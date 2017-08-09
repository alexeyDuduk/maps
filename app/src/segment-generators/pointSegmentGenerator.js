define([
    'app/utils/pointUtils',
    'app/app.settings'
], (PointUtils, simplify, settings) => {
    'use strict';

    return class PointSegmentGenerator {
        constructor(points) {
            this._points = points;
            this._provider = _getIterator(points);
            this._currentPoint = null;
            this._currentIndex = 0;
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

        getCurrentPointIndex() {
            return this._currentIndex;
        }

        getPoints() {
            return this._points;
        }

        getPointsCountInSegment() {
            return 1;
        }

        getPointsSet(count = this._points.length) {
            return this._points.slice(0, count);
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
