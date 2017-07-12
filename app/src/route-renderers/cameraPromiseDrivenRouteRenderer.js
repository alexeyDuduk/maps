(function () {
    "use strict";

    require(['esri/core/promiseUtils'], (promiseUtils) => {
        const SKIP_POINTS_BY_CAMERA = 20;

        class CameraPromiseDrivenRouteRenderer {
            constructor(view, segmentRenderer, cameraProvider) {
                this._view = view;
                this._segmentRenderer = segmentRenderer;
                this._cameraProvider = cameraProvider;
                this._index = -1;
            }

            draw(points, frameDuration) {
                return this._view.goTo(this._cameraProvider.getInitialCamera(), { animation: false })
                    .then(() => this._view.goTo(this._cameraProvider.getCamera(points[0]), { duration: 4000 }))
                    .then(() => this._goToNext(points[Symbol.iterator](), frameDuration));
            }

            _goToNext(pointsProvider, frameDuration) {
                let options = {
                    easing: 'linear',
                    duration: frameDuration / 2
                };

                let { value: point } = pointsProvider.next();
                if (!point) {
                    this._view.goTo(this._cameraProvider.getTotalViewCamera(), { duration: 3000 });
                    return;
                }

                this._segmentRenderer.addPoint(point);
                setTimeout(() => {
                        let promise = (++this._index) % SKIP_POINTS_BY_CAMERA === 0 ?
                            this._view.goTo(this._cameraProvider.getCamera(point), options) :
                            promiseUtils.resolve();

                        promise.then(() => this._goToNext(pointsProvider, frameDuration));
                    },
                frameDuration);
            }
        }

        window.EM.CameraPromiseDrivenRouteRenderer = CameraPromiseDrivenRouteRenderer;
    });
})();