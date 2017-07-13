(function () {
    "use strict";

    require([
        'esri/Graphic',
        'esri/geometry/Point',
        'esri/geometry/Polyline',
        'esri/symbols/PointSymbol3D',
        'esri/symbols/IconSymbol3DLayer',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/layers/GraphicsLayer',
        'esri/layers/FeatureLayer',
        'esri/renderers/SimpleRenderer'
    ], (Graphic, Point, Polyline, PointSymbol3D, IconSymbol3DLayer, SimpleMarkerSymbol, GraphicsLayer, FeatureLayer, SimpleRenderer) => {
        const colors = window.EM.settings.colors;

        class GraphicRouteSegmentRenderer {
            constructor (map, lineSymbol, lineAtt) {
                this._lineSymbol = lineSymbol;
                this._lineAtt = lineAtt;
                this._lastPath = null;
                this._routeLayer = new GraphicsLayer();
                this._currentPositionSymbol = new SimpleMarkerSymbol({
                    color: colors.BRAND_PRIMARY,
                    outline: {
                        color: 'white',
                        size: 2
                    },
                    size: 6,
                });
                this._pointsLayer = new FeatureLayer({
                    renderer: new SimpleRenderer({
                        symbol: this._currentPositionSymbol
                    }),
                    elevationInfo: {
                        mode: 'on-the-ground'
                    },
                    id: 11110,
                    source: [],
                    fields: [],
                    objectIdField: "id",
                    geometryType: "point",
                    title: 'Current point layer'
                });
                map.layers.add(this._routeLayer);
                map.layers.add(this._pointsLayer);
            }

            addPoint (point) {
                let path = this._lastPath ? [_.last(this._lastPath), point] : [point];

                this._addPath(path);
            }

            addPath (points) {
                if (this._lastPath) {
                    points.unshift(_.last(this._lastPath));
                }
                this._moveCurrentPoint(points);

                this._addPath(points);
            }

            _moveCurrentPoint (points) {
                let lastPoint = _.last(points);
                this._pointsLayer.source.removeAt(0);
                this._pointsLayer.source.add({
                    geometry: new Point({
                        latitude: lastPoint[1],
                        longitude: lastPoint[0]
                    })
                });
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
                this._routeLayer.graphics.add(g);
                this._lastPath = p.paths[0];
            }
        }

        window.EM.GraphicRouteSegmentRenderer = GraphicRouteSegmentRenderer;
    });
})();