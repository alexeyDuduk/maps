(function () {
    "use strict";

    require([
        'esri/Graphic',
        'esri/geometry/Point',
        'esri/tasks/RouteTask',
        'esri/tasks/support/RouteParameters',
        'esri/tasks/support/FeatureSet'
    ], (Graphic, Point, RouteTask, RouteParameters, FeatureSet) => {
        const MAX_POINTS_COUNT = 150; // api limitation

        class RouteTaskDataProviderWrapper {
            constructor(dataProvider) {
                this._dataProvider = dataProvider;
            }

            get() {
                return this._dataProvider.get()
                    .then(RouteTaskDataProviderWrapper._filterPoints)
                    .then(RouteTaskDataProviderWrapper._buildRoute)
                    .then((response) => _.flatten(response.routeResults[0].route.geometry.paths));
            }

            static _filterPoints(points) {
                if (points.length <= MAX_POINTS_COUNT) {
                    return points;
                }

                let step = Math.floor((points.length - 2) / (MAX_POINTS_COUNT - 2));
                let range = _.range(0, points.length - 2, step);
                range.push(points.length - 1);

                return _.map(range, (index) => points[index]);
            }

            static _buildRoute(points) {
                let routeTask = new RouteTask({
                    url: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World"
                });
                let features = _.map(points, (point) => new Graphic({
                    geometry: new Point({
                        latitude: point[1],
                        longitude: point[0]
                    })
                }));
                let featureSet = new FeatureSet({ features: features });

                return routeTask.solve(new RouteParameters({ stops: featureSet }));
            }
        }

        window.EM.RouteTaskDataProviderWrapper = RouteTaskDataProviderWrapper;
    });
})();