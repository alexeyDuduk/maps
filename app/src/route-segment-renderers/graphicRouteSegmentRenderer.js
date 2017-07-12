(function () {
    "use strict";

    require([
        'esri/geometry/Polyline',
        'esri/Graphic'
    ], (Polyline, Graphic) => {
        class GraphicRouteSegmentRenderer {
            constructor(view, lineSymbol, lineAtt) {
                this._view = view;
                this._lineSymbol = lineSymbol;
                this._lineAtt = lineAtt;
                this._lastPath = null;
            }

            addPoint(point) {
                let path = this._lastPath ? [_.last(this._lastPath), point] : [point];

                this._addPath(path);
            }

            addPath(points) {
                if (this._lastPath) {
                    points.unshift(_.last(this._lastPath));
                }

                this._addPath(points);
            }

            _addPath (path) {
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

        window.EM.GraphicRouteSegmentRenderer = GraphicRouteSegmentRenderer;
    });
})();