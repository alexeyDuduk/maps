require([
    'esri/Map',
    'esri/views/MapView',
    'esri/views/SceneView',
    'esri/geometry/Polyline',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/LineSymbol3D',
    'esri/symbols/LineSymbol3DLayer',
    'dojo/domReady!'
], function (Map,
             MapView,
             SceneView,
             Polyline,
             SimpleLineSymbol,
             LineSymbol3D,
             LineSymbol3DLayer
) {
    'use strict';

    const EM = window.EM;

    setTimeout(init, 300);


    function init() {
        //const pointsProvider = new EM.HyderabadDataProvider();
        //const pointsProvider = new EM.MinskDataProvider();
        //const pointsProvider = new EM.GpsiesDataProvider('bayreuth-10k');
        let pointsProvider = new EM.ProdDataProvider('prod-3');
        pointsProvider = new EM.RouteTaskDataProviderWrapper(pointsProvider);

        pointsProvider.get().then((points) => {
            let segmentGenerator = createRouteSegmentGenerator(points);
            let cameraProvider = new EM.CameraProvider(segmentGenerator);

            let map = new Map({
                basemap: 'hybrid',
                ground: 'world-elevation'
            });

            let camera = cameraProvider.getInitialCamera();
            let view = new SceneView({
                center: camera.center,
                container: 'view-div',
                map: map,
                zoom: camera.zoom,
                tilt: camera.tilt
            });

            let lineSymbol = new LineSymbol3D({
                symbolLayers: [
                    new LineSymbol3DLayer({
                        material: {
                            color: [226, 119, 40]
                        },
                        size: 4
                    })
                ]
            });

            let lineAtt = {
                Name: 'Keystone Pipeline',
                Owner: 'TransCanada',
                Length: '3,456 km'
            };

            let segmentRenderer = new EM.GraphicRouteSegmentRenderer(view, lineSymbol, lineAtt);
            //let segmentRenderer = new EM.PolyRouteSegmentRenderer(view, lineSymbol, lineAtt);

            let routeRenderer = new EM.CameraPromiseDrivenRouteRenderer(view, segmentRenderer, cameraProvider);
            //let routeRenderer = new EM.TimeoutDrivenRouteRenderer(segmentRenderer);

            view.then(() =>
                setTimeout(() => routeRenderer.draw(segmentGenerator), 5000)
            )
                .otherwise(() => console.log('view.otherwise'));
        });
    }

    function createRouteSegmentGenerator(points) {
        let step = Math.floor(points.length / EM.settings.route.MAX_POINTS_COUNT);

        return step ?
            new EM.PathSegmentGenerator(points, step) :
            new EM.PointSegmentGenerator(points);
    }
});