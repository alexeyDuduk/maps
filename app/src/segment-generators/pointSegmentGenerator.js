(function () {
    "use strict";

    require([], () => {
        class PointSegmentGenerator {
            constructor(points) {
                this._points = points;
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
                return this._currentPoint;
            }

            getPoints() {
                return this._points;
            }

            getPointsCountInSegment() {
                return 1;
            }
        }

        window.EM.PointSegmentGenerator = PointSegmentGenerator;

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
            }
        }
    });
})();