require([
    'esri/core/promiseUtils',
    'esri/Map',
    'esri/views/MapView',
    'esri/views/SceneView',
    'esri/geometry/Polyline',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/LineSymbol3D',
    'esri/symbols/LineSymbol3DLayer',
    'dojo/domReady!'
], function (promiseUtils,
             Map,
             MapView,
             SceneView,
             Polyline,
             SimpleLineSymbol,
             LineSymbol3D,
             LineSymbol3DLayer) {
    'use strict';

    const EM = window.EM;

    setTimeout(init, 300);


    function init () {
        //let dataProvider = new EM.HyderabadDataProvider();
        //let dataProvider = new EM.MinskDataProvider();
        //let dataProvider = new EM.GpsiesDataProvider('bayreuth-10k');
        let dataProvider = new EM.ProdDataProvider('prod-4');
        dataProvider = new EM.RouteTaskDataProviderWrapper(dataProvider);

        promiseUtils.eachAlways([
            dataProvider.getPoints(),
            dataProvider.getLocations()
        ]).then(([
                     {value: points = []},
                     {value: locations = []}
                 ]) => {
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
                            color: EM.settings.colors.BRAND_PRIMARY
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

            let segmentRenderer = new EM.GraphicRouteSegmentRenderer(map, lineSymbol, lineAtt);
            //let segmentRenderer = new EM.PolyRouteSegmentRenderer(view, lineSymbol, lineAtt);

            let routeRenderer = new EM.CameraPromiseDrivenRouteRenderer(view, segmentRenderer, cameraProvider);
            //let routeRenderer = new EM.TimeoutDrivenRouteRenderer(segmentRenderer);

            let featureRenderer = new EM.FeatureRenderer(map);

            view.then(() => {
                featureRenderer.draw(locations);
                setTimeout(() => {
                    routeRenderer.draw(segmentGenerator);
                }, 1000);
            })
                .otherwise(() => console.log('view.otherwise'));
        });
    }

    function createRouteSegmentGenerator (points) {
        let step = Math.floor(points.length / EM.settings.route.MAX_POINTS_COUNT);

        return step ? new EM.PathSegmentGenerator(points, step) : new EM.PointSegmentGenerator(points);
    }
});