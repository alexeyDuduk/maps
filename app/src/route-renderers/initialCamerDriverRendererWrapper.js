(function () {
    "use strict";

    require([], () => {
        class InitialCameraDrivenRendererWrapper {
            constructor(view, renderer, cameraProvider) {
                this._view = view;
                this._renderer = renderer;
                this._cameraProvider = cameraProvider;
            }

            draw(points, delay) {
                return this._view.goTo(this._cameraProvider.getInitialCamera(), { animation: false })
                    .then(() => this._view.goTo(this._cameraProvider.getCamera(points[0]), { duration: 2000 }))
                    .then(() => this._renderer.draw(points, delay));
            }
        }

        window.EM.InitialCameraDrivenRendererWrapper = InitialCameraDrivenRendererWrapper;
    });
})();