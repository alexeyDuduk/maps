(function () {
    "use strict";

    require([
        'esri/geometry/Polyline',
        'esri/Graphic',
        'esri/geometry/Point'
    ], (Polyline, Graphic, Point) => {
        class PathRouteSegmentRenderer {
            constructor(view, lineSymbol, lineAtt) {
                this._view = view;
                this._polyIndex = 0;
                this._polyline = new Polyline({
                    paths: [[]]
                    //hasZ: true
                });
                this._graphic = new Graphic({
                    geometry: this._polyline,
                    symbol: lineSymbol,
                    attributes: lineAtt
                });
                view.graphics.add(this._graphic);
            }

            addPoint(point) {
                let p = new Point({
                    x: point[0],
                    y: point[1]
                });
                let poly = this._polyline.insertPoint(this._polyIndex, this._polyline.paths[this._polyIndex].length, p);
                this._graphic.set('geometry', poly);
            }
        }

        window.EM.PathRouteSegmentRenderer = PathRouteSegmentRenderer;
    });
})();