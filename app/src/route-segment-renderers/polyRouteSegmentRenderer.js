(function () {
    "use strict";

    require([
        'esri/geometry/Polyline',
        'esri/Graphic'
    ], (Polyline, Graphic) => {
        class PolyRouteSegmentRenderer {
            constructor(view, lineSymbol, lineAtt) {
                this._view = view;
                this._lineSymbol = lineSymbol;
                this._lineAtt = lineAtt;
                this._polyIndex = 0;
                this._lastPath = null;
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
                let path = this._lastPath ? [_.last(this._lastPath), point] : [point];

                let p = new Polyline({
                    paths: path
                    //hasZ: true
                });
                let g = new Graphic({
                    geometry: p,
                    symbol: this._lineSymbol,
                    attributes: this._lineAtt
                });
                this._view.graphics.add(g);
                this._lastPath = p.paths[0];
            }
        }

        window.EM.PolyRouteSegmentRenderer = PolyRouteSegmentRenderer;
    });
})();