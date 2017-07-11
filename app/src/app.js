/*
 require([
 "esri/Map",
 "esri/views/SceneView",
 "dojo/domReady!"
 ], function(Map, SceneView) {
 var map = new Map({
 basemap: "topo",
 ground: "world-elevation"
 });
 var view = new SceneView({
 container: 'view-div',
 map: map,
 scale: 50000000,
 center: [-101.17, 21.78]
 })
 });*/
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/geometry/Polyline",
    "esri/symbols/SimpleLineSymbol",
    "esri/Graphic",
    "esri/PopupTemplate",
    "esri/geometry/Point",
    "dojo/domReady!"
], function (Map,
             MapView,
             SceneView,
             Polyline,
             SimpleLineSymbol,
             Graphic,
             PopupTemplate,
             Point) {
    'use strict';

    var hyderabadPoints = [
        { "x": 78.37744461933629, "y": 17.481010487155235, "z": 577.5304291521632 },
        { "x": 78.38949510230582, "y": 17.499461877291697, "z": 596.6795009070308 },
        { "x": 78.38957019331627, "y": 17.483625090258368, "z": 571.5583297464719 },
        { "x": 78.38727526909359, "y": 17.472091352609286, "z": 573.1539258538846 },
        { "x": 78.3847556837732, "y": 17.45968141420601, "z": 571.1908889726956 },
        { "x": 78.37905312787451, "y": 17.448843134448765, "z": 593.6640576515636 },
        { "x": 78.37270264249332, "y": 17.441907065389387, "z": 606.8650027336269 },
        { "x": 78.35918288651594, "y": 17.430486064982905, "z": 598.5454990063032 },
        { "x": 78.35451483958758, "y": 17.421325867548635, "z": 571.1160445160695 },
        { "x": 78.34250509235368, "y": 17.425347453822212, "z": 578.456168806125 },
        { "x": 78.33885134602971, "y": 17.42200236976013, "z": 571.9113018539742 }
    ];

    init();


    function init() {
        var points = hyderabadPoints;
        points = mapPointObjectsToArrays(points);
        points = fillWithIntermediatePoints(points, 10);
        var cameraProvider = new CameraProvider(points);

        var map = new Map({
            basemap: "hybrid",
            ground: "world-elevation"
        });

        var view = new SceneView({
            camera: cameraProvider.getInitialViewCamera(),
            container: "view-div",
            map: map
        });

        var lineSymbol = new SimpleLineSymbol({
            color: [226, 119, 40],
            width: 4
        });

        var lineAtt = {
            Name: "Keystone Pipeline",
            Owner: "TransCanada",
            Length: "3,456 km"
        };

        var segmentRenderer = new GraphicRouteSegmentRenderer(view, lineSymbol, lineAtt);
        //var segmentRenderer = new PolyRouteSegmentRenderer(view, lineSymbol, lineAtt);

        var routeRenderer = new CameraPromiseDrivenRouteRenderer(view, segmentRenderer, cameraProvider);
        //var routeRenderer = new TimeoutDrivenRouteRenderer(segmentRenderer);

        routeRenderer = new InitialCameraDrivenRendererWrapper(view, routeRenderer, cameraProvider);

        view.then(function () {
            setTimeout(function () {
                routeRenderer.draw(points, 10);
            }, 5000);
        });
    }


    // utils
    function _last(array) {
        return array[array.length - 1];
    }

    function _enumerable(array) {
        var index = -1;

        return {
            getNext: function () {
                return array[++index];
            }
        };
    }

    function fillWithIntermediatePoints(points, bits) {
        var result = [];

        points.forEach(function (item, index) {
            if (!index) {
                result.push(item);
                return;
            }
            var bitIndex = 1;
            var previousItem = points[index - 1];
            var kx = item[0] - previousItem[0];
            var ky = item[1] - previousItem[1];

            while (bitIndex <= bits) {
                var ratio = bitIndex / bits;

                result.push([
                    previousItem[0] + kx * ratio,
                    previousItem[1] + ky * ratio
                ]);
                bitIndex++;
            }
        });

        return result;
    }

    function getRandomPointsProvider() {
        return {
            getNext: generateRandomPoint
        };
    }

    function generateRandomPoint() {
        var latMin = -90;
        var latMax = 90;
        var longMin = -180;
        var longMax = 180;

        function randomFromRange(from, to) {
            return Math.random() * (to - from) + from;
        }

        return [randomFromRange(longMin, longMax), randomFromRange(latMin, latMax)];
    }

    function mapPointObjectsToArrays(points) {
        return points.map(function (item) {
            return [item.x, item.y];
        });
    }


    // route renderers
    function CameraPromiseDrivenRouteRenderer(view, segmentRenderer, cameraProvider) {
        this.draw = draw;

        init();

        function init() {

        }

        function draw(points, frameDuration) {
            var options = {
                easing: 'linear',
                duration: frameDuration / 2
            };

            goToNext(_enumerable(points));

            function goToNext(pointsProvider) {
                var point = pointsProvider.getNext();
                if (!point) {
                    view.goTo(cameraProvider.getTotalViewCamera(), { duration: 3000 });
                    return;
                }

                segmentRenderer.addPoint(point);
                setTimeout(function () {
                    return view.goTo(cameraProvider.getCamera(point), options)
                        .then(function () {
                            goToNext(pointsProvider);
                        });
                }, frameDuration);
            }
        }
    }

    function TimeoutDrivenRouteRenderer(segmentRenderer) {
        this.draw = draw;

        init();

        function init() {

        }

        function draw(points, delay) {
            var pointsProvider = _enumerable(points);
            var intervalId = setInterval(function () {
                try {
                    var point = pointsProvider.getNext();

                    if (!point) {
                        clearInterval(intervalId);
                        intervalId = null;
                        return;
                    }
                    segmentRenderer.addPoint(point);
                }
                catch (e) {
                    console.log(e);
                }
            }, delay);
        }
    }


    // route segment renderers
    function GraphicRouteSegmentRenderer(view, lineSymbol, lineAtt) {
        var lastPath = null;


        this.addPoint = addPoint;

        init();


        function init() {

        }

        function addPoint(point) {
            var path = lastPath ? [_last(lastPath), point] : [point];

            var p = new Polyline({
                paths: path
                //hasZ: true
            });
            var g = new Graphic({
                geometry: p,
                symbol: lineSymbol,
                attributes: lineAtt
            });
            view.graphics.add(g);
            lastPath = p.paths[0];
        }
    }

    function PathRouteSegmentRenderer(view, lineSymbol, lineAtt) {
        var polyline = null;
        var graphic = null;
        var polyIndex = 0;


        this.addPoint = addPoint;

        init();


        function init() {
            polyline = new Polyline({
                paths: [[]]
                //hasZ: true
            });
            graphic = new Graphic({
                geometry: polyline,
                symbol: lineSymbol,
                attributes: lineAtt
            });
            view.graphics.add(graphic);
        }

        function addPoint(point) {
            debugger;
            console.log('addPoint', point);
            var p = new Point({
                x: point[0],
                y: point[1]
            });
            var poly = polyline.insertPoint(polyIndex, polyline.paths[polyIndex].length, p);
            graphic.set('geometry', poly);
        }
    }

    function PolyRouteSegmentRenderer(view, lineSymbol, lineAtt) {
        var polyline = null;
        var graphic = null;
        var polyIndex = 0;


        this.addPoint = addPoint;

        init();


        function init() {
            polyline = new Polyline({
                paths: [[]]
                //hasZ: true
            });
            graphic = new Graphic({
                geometry: polyline,
                symbol: lineSymbol,
                attributes: lineAtt
            });
            view.graphics.add(graphic);
        }

        function addPoint(point) {
            debugger;
            var p = new Point({
                x: point[0],
                y: point[1]
            });
            console.log('addPoint', p);
            var lastPath = _last(polyline.paths) || [];
            var lastPoint = _last(lastPath);
            var path = lastPoint ? [lastPoint, point] : [point];
            console.log(path);
            var poly = polyline.addPath(path);
            graphic.set({ geometry: poly });
        }
    }

    function InitialCameraDrivenRendererWrapper(view, renderer, cameraProvider) {
        this.draw = draw;

        init();

        function init() {
        }

        function draw(points, delay) {
            return view.goTo(cameraProvider.getInitialCamera(), { animation: false })
                .then(function () {
                    return view.goTo(cameraProvider.getCamera(points[0]), { duration: 2000 });
                })
                .then(function () {
                    return renderer.draw(points, delay);
                });
        }
    }


    function CameraProvider(points) {
        var DEFAULT_ZOOM = 15;
        var latSum = 0;
        var lngSum = 0;
        var count = 0;

        this.getInitialCamera = getInitialCamera;
        this.getCamera = getCamera;
        this.getTotalViewCamera = getTotalViewCamera;
        this.getInitialViewCamera = getInitialViewCamera;

        init();

        function init() {
        }

        function getInitialViewCamera() {
            return {
                position: points[0].slice(0, 2).concat([4000]),
                tilt: 0
            }
        }

        function getInitialCamera() {
            return {
                center: points[0].slice(0, 2),
                zoom: DEFAULT_ZOOM,
                tilt: 0
            }
        }

        function getCamera(point, index) {
            latSum += point[0];
            lngSum += point[1];
            count++;

            var averagePoint = [ latSum / count, lngSum / count ];
            var heading = 0;
            if (count > 2) {
                var dy = point[1] - averagePoint[1];
                var dx = point[0] - averagePoint[0];
                var tg = dx / dy;
                heading = Math.atan(tg) * 180 / Math.PI;
                if (dy < 0) {
                    heading += 180 * (dx > 0 ? 1 : -1);
                }
            }
            console.log('heading', heading);
            //debugger

            return {
                center: point.slice(0, 2),
                zoom: DEFAULT_ZOOM,
                tilt: 45,
                heading: heading
            }
        }

        function getTotalViewCamera() {
            return {
                target: points,
                tilt: 30
            }
        }
    }
});