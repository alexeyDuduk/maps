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
    'app/utils/promiseUtils',
    'app/utils/pointUtils',
    'app/utils/eventManager'
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
    PromiseUtils,
    PointUtils,
    eventManager
) => {
    'use strict';

    return class App {
        run () {
            return PromiseUtils.timeout(() => this.init(), 300);
        }

        initWatchers () {
            eventManager.on('view:render:start',    () => console.log('phantom:start'));
            eventManager.on('view:update:end',      () => console.log('phantom:render'));
            eventManager.on('view:render:end',      () => console.log('phantom:end'));
            eventManager.on('view:error',           () => console.log('phantom:end'));
        }

        init () {
            IdentityManager.registerToken({
                server: settings.access.server,
                token: settings.access.token
            });

            this.initWatchers();

            //let originalDataProvider = new HyderabadDataProvider();
            //let originalDataProvider = new MinskDataProvider();
            //let originalDataProvider = new GpsiesDataProvider('bayreuth-10k');
            let originalDataProvider = new ProdDataProvider('prod-5');
            originalDataProvider = new CachingDataProviderWrapper(originalDataProvider);
            let dataProvider = new RouteTaskDataProviderWrapper(originalDataProvider);

            PromiseUtils.whenAll([
                originalDataProvider.getPoints(),
                dataProvider.getPoints(),
                // dataProvider.getLocations()
            ]).then(([
                         originalPoints = [],
                         points = [],
                         locations = []
                     ]) => {
                points = PointUtils.fillWithIntermediatePoints(points, 2);
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
                            size: 6
                        })
                    ]
                });

                let lineAtt = {
                    Name: 'Keystone Pipeline',
                    Owner: 'TransCanada',
                    Length: '3,456 km'
                };

                let segmentRenderer = new GraphicRouteSegmentRenderer(map, view, lineSymbol, lineAtt);
                //let segmentRenderer = new PolyRouteSegmentRenderer(view, lineSymbol, lineAtt);

                let routeRenderer = new CameraPromiseDrivenRouteRenderer(view, segmentRenderer, cameraProvider);
                //let routeRenderer = new TimeoutDrivenRouteRenderer(segmentRenderer);

                let featureRenderer = new FeatureRenderer(map, [settings.locations.PICKUP, settings.locations.DELIVERY]);
                let luFeatureRenderer = new FeatureRenderer(map, [settings.locations.INTERMEDIATE]);    // real location updates points
                let originalLuFeatures = this._convertPointsToFeatures(originalPoints);

                view.then(() => {
                    this._startRendering();

                    featureRenderer.draw(locations);
                    // luFeatureRenderer.draw(originalLuFeatures);
                })
                    .then(() => PromiseUtils.timeout(() => {}, 1000))
                    .then(() => routeRenderer.draw(segmentGenerator))
                    .then(() => this._stopRendering())
                    .otherwise((err) => {
                        eventManager.emit('view:error');
                        console.log('view.otherwise', err);
                    });
            });
        }

        _createRouteSegmentGenerator (points) {
            return new PointSegmentGenerator(points);
        }

        _convertPointsToFeatures (points) {
            return _.map(points, (item, index) => ({
                    geometry: item,
                    type: settings.locations.INTERMEDIATE,
                    id: index
                })
            );
        }

        _startRendering () {
            eventManager.emit('view:render:start');
            console.time('rendering');
        }

        _stopRendering () {
            console.timeEnd('rendering');
            PromiseUtils.timeout(() => {
                eventManager.emit('view:render:end');
            }, 5000);
        }
    };
});
