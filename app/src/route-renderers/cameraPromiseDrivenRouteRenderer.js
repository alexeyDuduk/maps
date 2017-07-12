(function () {
    "use strict";

    require(['esri/core/promiseUtils'], (promiseUtils) => {
        const SKIP_POINTS_BY_CAMERA = 1;

        class CameraPromiseDrivenRouteRenderer {
            constructor(view, segmentRenderer, cameraProvider) {
                this._view = view;
                this._segmentRenderer = segmentRenderer;
                this._cameraProvider = cameraProvider;
                this._index = -1;
            }

            draw(segmentGenerator, frameDuration) {
                return this._view.goTo(this._cameraProvider.getInitialCamera(), { animation: false })
                    .then(() => {
                        let point = segmentGenerator.getInitialPoint();
                        let camera = this._cameraProvider.getCamera(point);

                        return this._view.goTo(camera, {duration: 4000});
                    })
                    .then(() => this._goToNext(segmentGenerator, frameDuration));
            }

            _goToNext(segmentGenerator, frameDuration) {
                let options = {
                    easing: 'linear',
                    duration: frameDuration
                };

                if (!segmentGenerator.moveToNext()) {
                    return this._view.goTo(this._cameraProvider.getTotalViewCamera(), { duration: 3000 });
                }

                let promise = (++this._index) % SKIP_POINTS_BY_CAMERA === 0 ?
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