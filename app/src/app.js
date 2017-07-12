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

    init();


    function init() {
        //const pointsProvider = new EM.HyderabadDataProvider();
        //const pointsProvider = new EM.MinskDataProvider();
        const pointsProvider = new EM.GpsiesDataProvider('bayreuth-10k');

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
                setTimeout(() => routeRenderer.draw(segmentGenerator, 10), 5000)
            );
        });
    }

    function createRouteSegmentGenerator(points) {
        const MAX_POINTS_COUNT = 400;
        let step = Math.floor(points.length / MAX_POINTS_COUNT);

        return step ?
            new EM.PathSegmentGenerator(points, step) :
            new EM.PointSegmentGenerator(points);
    }
});