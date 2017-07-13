(function () {
    "use strict";

    require(['esri/core/promiseUtils'], (promiseUtils) => {
        const settings = window.EM.settings.camera;

        class CameraPromiseDrivenRouteRenderer {
            constructor(view, segmentRenderer, cameraProvider) {
                this._view = view;
                this._segmentRenderer = segmentRenderer;
                this._cameraProvider = cameraProvider;
                this._index = -1;
                this._segmentsPerCameraPosition = 1;
            }

            draw(segmentGenerator) {
                this._segmentsPerCameraPosition = Math.ceil(
                    settings.POINTS_COUNT_PER_CAMERA_POSITION / segmentGenerator.getPointsCountInSegment()
                );

                return this._view.goTo(this._cameraProvider.getInitialCamera(), { animation: false })
                    .then(() => {
                        let point = segmentGenerator.getInitialPoint();
                        let camera = this._cameraProvider.getCamera(point);

                        return this._view.goTo(camera, { duration: settings.INITIAL_TRANSITION_DURATION });
                    })
                    .then(() => this._goToNext(segmentGenerator, settings.FRAME_DURATION));
            }

            _goToNext(segmentGenerator, frameDuration) {
                let options = {
                    easing: 'linear',
                    duration: frameDuration
                };

                if (!segmentGenerator.moveToNext()) {
                    return this._view.goTo(this._cameraProvider.getTotalViewCamera(), {
                        duration: settings.TOTAL_VIEW_TRANSITION_DURATION
                    });
                }

                let promise = (++this._index) % this._segmentsPerCameraPosition === 0 ?
                    this._view.goTo(this._cameraProvider.getCamera(segmentGenerator.getCurrentPoint()), options) :
                    promiseUtils.resolve();

                promise.then(() => {
                    setTimeout(() => {
                        this._segmentRenderer.addPath(segmentGenerator.getSegment());
                        this._goToNext(segmentGenerator, frameDuration);
                    },
                    frameDuration);
                });
            }
        }

        window.EM.CameraPromiseDrivenRouteRenderer = CameraPromiseDrivenRouteRenderer;
    });
})();