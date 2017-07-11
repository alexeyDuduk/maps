(function () {
    "use strict";

    require([], () => {
        class CameraPromiseDrivenRouteRenderer {
            constructor(view, segmentRenderer, cameraProvider) {
                this._view = view;
                this._segmentRenderer = segmentRenderer;
                this._cameraProvider = cameraProvider;
            }

            draw(points, frameDuration) {
                return this._goToNext(points[Symbol.iterator](), frameDuration);
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
                setTimeout(() =>
                    this._view.goTo(this._cameraProvider.getCamera(point), options)
                        .then(() => this._goToNext(pointsProvider, frameDuration)),
                frameDuration);
            }
        }

        window.EM.CameraPromiseDrivenRouteRenderer = CameraPromiseDrivenRouteRenderer;
    });
})();