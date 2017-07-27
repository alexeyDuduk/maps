require([
    'esri/core/promiseUtils',
    'esri/Map',
    'esri/views/MapView',
    'esri/views/SceneView',
    'esri/geometry/Polyline',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/LineSymbol3D',
    'esri/symbols/LineSymbol3DLayer',
    'esri/identity/IdentityManager',
    'dojo/domReady!'
], function (promiseUtils,
             Map,
             MapView,
             SceneView,
             Polyline,
             SimpleLineSymbol,
             LineSymbol3D,
             LineSymbol3DLayer,
             IdentityManager
 ) {
    'use strict';

    const EM = window.EM;
    const settings = EM.settings;

    setTimeout(init, 300);

    function init () {

        IdentityManager.registerToken({
            server: 'https://route.arcgis.com/arcgis/rest/services',
            token:  'k033vEafZ518YyQEZ2jguJLm57ycI_ymIPAABv_sWnHmvBxm9wQMsRT4DRlz8IN3IPQZxBy4CnF0cfTB_CuP1lL5HkMjBb1kpe-KJ5lPE6jWD6qM8E1mnGFmRAkMWN4AeoCWTiveLLZIbInF8n-z9g..'
        });

        //let originalDataProvider = new EM.HyderabadDataProvider();
        //let originalDataProvider = new EM.MinskDataProvider();
        //let originalDataProvider = new EM.GpsiesDataProvider('bayreuth-10k');
        let originalDataProvider = new EM.ProdDataProvider('prod-4');
        originalDataProvider = new EM.CachingDataProviderWrapper(originalDataProvider);
        let dataProvider = new EM.RouteTaskDataProviderWrapper(originalDataProvider);

        promiseUtils.eachAlways([
            originalDataProvider.getPoints(),
            dataProvider.getPoints(),
            dataProvider.getLocations()
        ]).then(([
                     {value: originalPoints = []},
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

            let featureRenderer = new EM.FeatureRenderer(map, [ settings.locations.PICKUP, settings.locations.DELIVERY ]);
            let luFeatureRenderer = new EM.FeatureRenderer(map, [ settings.locations.INTERMEDIATE ]);    // real location updates points
            let originalLuFeatures = convertPointsToFeatures(originalPoints);

            view.then(() => {
                console.log('phantom:start');
                featureRenderer.draw(locations);
                luFeatureRenderer.draw(originalLuFeatures);
                setTimeout(() => {
                    routeRenderer.draw(segmentGenerator).then(() => {
                        console.log('phantom:finish');
                    });
                }, 1000);
            })
                .otherwise(() => console.log('view.otherwise'));
        });
    }

    function createRouteSegmentGenerator (points) {
        let step = Math.floor(points.length / EM.settings.route.MAX_POINTS_COUNT);

        return step ? new EM.PathSegmentGenerator(points, step) : new EM.PointSegmentGenerator(points);
    }

    function convertPointsToFeatures(points) {
        return _.map(points, (item, index) => ({
                geometry:       item,
                type:           settings.locations.INTERMEDIATE,
                id:             index
            })
        );
    }
});
