(function () {
    "use strict";

    require([], () => {
        class PathSegmentGenerator {
            constructor(points, step) {
                this._points = points;
                this._step = step;
                this._currentIndex = -step;
            }

            getSegment() {
                return this._points.slice(this._currentIndex, this._currentIndex + this._step);
            }

            moveToNext() {
                this._currentIndex += this._step;

                return this._currentIndex < this._points.length;
            }

            getInitialPoint() {
                return this._points[0];
            }

            getCurrentPoint() {
                return this._points[this._currentIndex];
            }

            getPoints() {
                return this._points;
            }

            getPointsCountInSegment() {
                return this._step;
            }
        }

        window.EM.PathSegmentGenerator = PathSegmentGenerator;
    });
})();