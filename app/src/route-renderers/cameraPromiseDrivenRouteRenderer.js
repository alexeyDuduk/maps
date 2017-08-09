define([
    'app/app.settings',
    'app/utils/promiseUtils'
], (appSettings, PromiseUtils) => {
    'use strict';

    const settings = appSettings.camera;

    return class CameraPromiseDrivenRouteRenderer {
        constructor(view, segmentRenderer, cameraProvider, debugRenderer) {
            this._view = view;
            this._segmentRenderer = segmentRenderer;
            this._debugRenderer = debugRenderer;
            this._cameraProvider = cameraProvider;
            this._index = -1;
            this._segmentsPerCameraPosition = 1;
        }

        draw(segmentGenerator) {
            this._beforeDraw(segmentGenerator);

            this._showPath(segmentGenerator);

            return this._moveToInitialScene()
                .then(() => this._runIntro(segmentGenerator))
                .then(() => this._runByRoute(segmentGenerator))
                .then(() => this._showTotalScene());
        }

        _beforeDraw(segmentGenerator) {
            this._segmentsPerCameraPosition = Math.ceil(
                settings.POINTS_COUNT_PER_CAMERA_POSITION / segmentGenerator.getPointsCountInSegment()
            );
        }

        _moveToInitialScene() {
            return this._view.goTo(this._cameraProvider.getInitialCamera());
        }

        _runIntro(segmentGenerator) {
            let point = segmentGenerator.getInitialPoint();
            let camera = this._cameraProvider.getCamera(point);

            return this._view.goTo(camera, { duration: settings.INITIAL_TRANSITION_DURATION });
        }

        // displays original and interpolated route for testing
        _showPath(segmentGenerator) {
            let points = segmentGenerator.getPointsSet(950);
            let pointsInter = this._cameraProvider.getInterpolatedPointsSet(950);

            let camera = {
                target: points,
                tilt: 0,
                heading: 0
            };

            return this._view.goTo(camera).then(() => {
                //this.debugRenderer.addPath(points);
                this._debugRenderer.addPath(pointsInter);
            });
        }

        _runByRoute (segmentGenerator) {
            console.log('_runByRoute');
            let goToNext            = () => {};
            let tryGoToNextSegment  = () =>
                segmentGenerator.moveToNext() ?
                    goToNext() :
                    PromiseUtils.resolve();

            goToNext = () =>
                this._goToNext(segmentGenerator)
                    .then(tryGoToNextSegment);

            return tryGoToNextSegment();
        }

        _goToNext(segmentGenerator) {
            let options = {
                animate: false
            };

            let promise;

            if ((++this._index) % this._segmentsPerCameraPosition === 0) {
                promise = this._view.goTo(
                    this._cameraProvider.getCamera(),
                    options
                );
            } else {
                promise = PromiseUtils.resolve();
            }

            return promise.then(() => this._segmentRenderer.addPath(segmentGenerator.getSegment()));
        }

        _showTotalScene() {
            return this._view.goTo(this._cameraProvider.getTotalViewCamera(), {
                duration: settings.TOTAL_VIEW_TRANSITION_DURATION
            });
        }
    };
});
