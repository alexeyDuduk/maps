define([
    'esri/Graphic',
    'esri/geometry/Point',
    'esri/tasks/RouteTask',
    'esri/tasks/support/RouteParameters',
    'esri/tasks/support/FeatureSet',
    'app/app.settings',
    'app/data-providers/baseDataProvider'
], (Graphic, Point, RouteTask, RouteParameters, FeatureSet, appSettings, BaseDataProvider) => {
    'use strict';

    const settings = appSettings.routeBuilder;

    return class RouteTaskDataProviderWrapper extends BaseDataProvider {
        constructor(dataProvider) {
            super();
            this._dataProvider = dataProvider;
        }

        getPoints() {
            return this._dataProvider.getPoints()
                .then(RouteTaskDataProviderWrapper._filterPoints)
                .then(RouteTaskDataProviderWrapper._buildRoute)
                .then((response) => _.flatten(response.routeResults[0].route.geometry.paths));
        }

        getLocations() {
            return this._dataProvider.getLocations();
        }

        static _filterPoints(points) {
            let pointsCountToProcess = Math.floor(points.length * settings.POINTS_PERCENT_TO_PROCESS / 100);
            pointsCountToProcess = Math.max(
                Math.min(pointsCountToProcess, settings.MAX_POINTS_COUNT),
                settings.MIN_POINTS_COUNT//,
                //points.length
            );

            let step = Math.floor((points.length - 2) / (pointsCountToProcess - 2));
            let range = _.range(0, points.length - 2, step);
            range.push(points.length - 1);
            console.log('pointsCountToProcess', pointsCountToProcess, 'range.length', range.length);

            return _.map(range, (index) => points[index]);
        }

        static _buildRoute(points) {
            let routeTask = new RouteTask({
                url: settings.URL
            });
            let features = _.map(points, (point) => new Graphic({
                geometry: new Point({
                    latitude: point[1],
                    longitude: point[0]
                })
            }));
            let featureSet = new FeatureSet({ features: features });

            return routeTask.solve(new RouteParameters({
                stops: featureSet,
                //impedanceAttribute: 'Length'
                findBestSequence: false,
                restrictUTurns: 'allow-backtrack'
            }));
        }
    };
});