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
    'app/data-providers/locationUpdatesDataProvider',
    'app/data-providers/cachingDataProviderWrapper',
    'app/data-providers/routeTaskDataProviderWrapper',
    'app/camera/cameraProvider',
    'app/route-segment-renderers/graphicRouteSegmentRenderer',
    'app/route-renderers/cameraPromiseDrivenRouteRenderer',
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
    LocationUpdatesDataProvider,
    CachingDataProviderWrapper,
    RouteTaskDataProviderWrapper,
    CameraProvider,
    GraphicRouteSegmentRenderer,
    CameraPromiseDrivenRouteRenderer,
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

        getParams () {
            let id = '1';
            let search = window.location.search;
            if (search) {
                let params = search.split('&');
                id = params[0].split('=')[1];
                let key = params[1].split('=')[1];

                return { id, key };
            }
        }

        init () {
            let { id, key } = this.getParams();
            IdentityManager.registerToken({
                server: settings.access.server,
                token: key
            });

            this.initWatchers();

            let dataProvider = new LocationUpdatesDataProvider(`prod-${id}`);
            let routeTask = new RouteTaskDataProviderWrapper();

            dataProvider.getPoints()
                .then(data => PromiseUtils.whenAll([
                    data,
                    routeTask.getPointsFrom(_.map(data, 'geometry'))
                ]))
                .then(([data, points = []]) => {
                    let locations = dataProvider.extractLocations(data);
                    console.log('locations', locations);
                    let originalPoints = [];

                    let segmentGenerator = this._createRouteSegmentGenerator(points);

                    let first = _.first(data);
                    first.type = settings.locations.INTERMEDIATE;

                    let last = _.last(data);
                    last.type = settings.locations.INTERMEDIATE;
                    let cameraProvider = new CameraProvider(segmentGenerator, locations);

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
                    let debugRenderer = new GraphicRouteSegmentRenderer(map, view, new LineSymbol3D({
                        symbolLayers: [
                            new LineSymbol3DLayer({
                                material: {
                                    color: 'red'
                                },
                                size: 2
                            })
                        ]
                    }), lineAtt);

                    let routeRenderer = new CameraPromiseDrivenRouteRenderer(view, segmentRenderer, cameraProvider, debugRenderer);

                    let featureRenderer = new FeatureRenderer(map, [settings.locations.PICKUP, settings.locations.DELIVERY]);
                    let luFeatureRenderer = new FeatureRenderer(map, [settings.locations.INTERMEDIATE]);    // real location updates points
                    let originalLuFeatures = this._convertPointsToFeatures(originalPoints);

                    view.then(() => {
                        this._startRendering();

                        featureRenderer.draw(locations);
                        //luFeatureRenderer.draw(originalLuFeatures);
                    })
                        .then(() => PromiseUtils.timeout(() => {
                        }, 1000))
                        .then(() => routeRenderer.draw(segmentGenerator))
                        .then(() => this._stopRendering())
                        .otherwise((err) => {
                            console.error('view.otherwise', err);
                            eventManager.emit('view:error');
                        });
                });
        }

        _createRouteSegmentGenerator(points) {
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
