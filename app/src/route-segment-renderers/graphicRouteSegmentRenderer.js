(function () {
    "use strict";

    require([
        'esri/geometry/Polyline',
        'esri/Graphic'
    ], (Polyline, Graphic) => {
        let lastPath = null;


        class GraphicRouteSegmentRenderer {
            constructor(view, lineSymbol, lineAtt) {
                this._view = view;
                this._lineSymbol = lineSymbol;
                this._lineAtt = lineAtt;
            }

            addPoint(point) {
                let path = lastPath ? [_.last(lastPath), point] : [point];

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
                lastPath = p.paths[0];
            }
        }

        window.EM.GraphicRouteSegmentRenderer = GraphicRouteSegmentRenderer;
    });
})();