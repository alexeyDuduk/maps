define([
    'esri/Map',
    'esri/views/MapView',
    'esri/views/SceneView',
    'esri/geometry/Polyline',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/LineSymbol3D',
    'esri/symbols/LineSymbol3DLayer',
    'esri/identity/IdentityManager',
    'app/app.settings',
    'app/data-providers/hyderabadDataProvider',
    'app/data-providers/minskDataProvider',
    'app/data-providers/gpsiesDataProvider',
    'app/data-providers/prodDataProvider',
    'app/data-providers/cachingDataProviderWrapper',
    'app/data-providers/routeTaskDataProviderWrapper',
    'app/camera/cameraProvider',
    'app/route-segment-renderers/graphicRouteSegmentRenderer',
    'app/route-segment-renderers/polyRouteSegmentRenderer',
    'app/route-renderers/cameraPromiseDrivenRouteRenderer',
    'app/route-renderers/timeoutDrivenRouteRenderer',
    'app/features-renderers/featureRenderer',
    'app/segment-generators/pathSegmentGenerator',
    'app/segment-generators/pointSegmentGenerator',
    'app/utils/promiseUtils'
], (Map,
    MapView,
    SceneView,
    Polyline,
    SimpleLineSymbol,
    LineSymbol3D,
    LineSymbol3DLayer,
    IdentityManager,
    settings,
    HyderabadDataProvider,
    MinskDataProvider,
    GpsiesDataProvider,
    ProdDataProvider,
    CachingDataProviderWrapper,
    RouteTaskDataProviderWrapper,
    CameraProvider,
    GraphicRouteSegmentRenderer,
    PolyRouteSegmentRenderer,
    CameraPromiseDrivenRouteRenderer,
    TimeoutDrivenRouteRenderer,
    FeatureRenderer,
    PathSegmentGenerator,
    PointSegmentGenerator,
    PromiseUtils
) => {
    'use strict';

    return class App {
        run () {
            return PromiseUtils.timeout(() => this.init(), 300);
        }

        init () {
            IdentityManager.registerToken({
                server: settings.access.server,
                token: settings.access.token
            });

            //let originalDataProvider = new HyderabadDataProvider();
            //let originalDataProvider = new MinskDataProvider();
            //let originalDataProvider = new GpsiesDataProvider('bayreuth-10k');
            let originalDataProvider = new ProdDataProvider('prod-4');
            originalDataProvider = new CachingDataProviderWrapper(originalDataProvider);
            let dataProvider = new RouteTaskDataProviderWrapper(originalDataProvider);

            PromiseUtils.whenAll([
                originalDataProvider.getPoints(),
                dataProvider.getPoints(),
                dataProvider.getLocations()
            ]).then(([
                         originalPoints = [],
                         points = [],
                         locations = []
                     ]) => {
                let segmentGenerator = this._createRouteSegmentGenerator(points);
                let cameraProvider = new CameraProvider(segmentGenerator);

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
                                color: settings.colors.BRAND_PRIMARY
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

                let segmentRenderer = new GraphicRouteSegmentRenderer(map, lineSymbol, lineAtt);
                //let segmentRenderer = new PolyRouteSegmentRenderer(view, lineSymbol, lineAtt);

                let routeRenderer = new CameraPromiseDrivenRouteRenderer(view, segmentRenderer, cameraProvider);
                //let routeRenderer = new TimeoutDrivenRouteRenderer(segmentRenderer);

                let featureRenderer = new FeatureRenderer(map, [settings.locations.PICKUP, settings.locations.DELIVERY]);
                let luFeatureRenderer = new FeatureRenderer(map, [settings.locations.INTERMEDIATE]);    // real location updates points
                let originalLuFeatures = this._convertPointsToFeatures(originalPoints);

                view.then(() => {
                    console.log('phantom:start');
                    featureRenderer.draw(locations);
                    luFeatureRenderer.draw(originalLuFeatures);
                })
                    .then(() => PromiseUtils.timeout(() => {}, 1000))
                    .then(() => routeRenderer.draw(segmentGenerator))
                    .then(() => console.log('phantom:finish'))
                    .otherwise(() => console.log('view.otherwise'));
            });
        }

        _createRouteSegmentGenerator (points) {
            let step = Math.floor(points.length / settings.route.MAX_POINTS_COUNT);

            return step ? new PathSegmentGenerator(points, step) : new PointSegmentGenerator(points);
        }

        _convertPointsToFeatures (points) {
            return _.map(points, (item, index) => ({
                    geometry: item,
                    type: settings.locations.INTERMEDIATE,
                    id: index
                })
            );
        }
    };
});
