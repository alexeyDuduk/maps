(function () {
    "use strict";

    require(['esri/core/promiseUtils'], (promiseUtils) => {
        const EM = window.EM;
        const settings = EM.settings.camera;

        class CameraPromiseDrivenRouteRenderer {
            constructor(view, segmentRenderer, cameraProvider) {
                this._view = view;
                this._segmentRenderer = segmentRenderer;
                this._cameraProvider = cameraProvider;
                this._index = -1;
                this._segmentsPerCameraPosition = 1;
            }

            draw(segmentGenerator) {
                this._beforeDraw(segmentGenerator);

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

            _runByRoute (segmentGenerator) {
                let goToNext            = () => {};
                let tryGoToNextSegment  = () =>
                    segmentGenerator.moveToNext() ?
                        goToNext() :
                        EM.PromiseUtils.resolve();

                goToNext = () =>
                    this._goToNext(segmentGenerator, settings.FRAME_DURATION)
                        .then(tryGoToNextSegment);

                return tryGoToNextSegment();
            }

            _goToNext(segmentGenerator, frameDuration) {
                let options = {
                    easing: 'linear',
                    //duration: frameDuration/2
                    speedFactor: settings.SPEED_FACTOR
                };

                let promise = (++this._index) % this._segmentsPerCameraPosition === 0 ?
                    this._view.goTo(this._cameraProvider.getCamera(segmentGenerator.getCurrentPoint()), options) :
                    promiseUtils.resolve();

                return promise.then(() => EM.PromiseUtils.timeout(() => {}, frameDuration / 2))
                    .then(() => this._segmentRenderer.addPath(segmentGenerator.getSegment()))
                    .then(() => EM.PromiseUtils.timeout(() => {}, frameDuration / 2));
            }

            _showTotalScene() {
                return this._view.goTo(this._cameraProvider.getTotalViewCamera(), {
                    duration: settings.TOTAL_VIEW_TRANSITION_DURATION
                });
            }
        }

        window.EM.CameraPromiseDrivenRouteRenderer = CameraPromiseDrivenRouteRenderer;
    });
})();