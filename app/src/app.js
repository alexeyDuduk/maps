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
        const pointsProvider = new EM.MinskDataProvider();
        pointsProvider.get().then((points) => {
            let cameraProvider = new EM.CameraProvider(points);

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
                setTimeout(() => routeRenderer.draw(points, 10), 5000)
            );
        });
    }

    function fillWithIntermediatePoints(points, bits) {
        let result = [];

        points.forEach(function (item, index) {
            if (!index) {
                result.push(item);
                return;
            }
            let bitIndex = 1;
            let previousItem = points[index - 1];
            let kx = item[0] - previousItem[0];
            let ky = item[1] - previousItem[1];

            while (bitIndex <= bits) {
                let ratio = bitIndex / bits;

                result.push([
                    previousItem[0] + kx * ratio,
                    previousItem[1] + ky * ratio
                ]);
                bitIndex++;
            }
        });

        return result;
    }

    function generateRandomPoint() {
        let latMin = -90;
        let latMax = 90;
        let longMin = -180;
        let longMax = 180;

        function randomFromRange(from, to) {
            return Math.random() * (to - from) + from;
        }

        return [randomFromRange(longMin, longMax), randomFromRange(latMin, latMax)];
    }
});