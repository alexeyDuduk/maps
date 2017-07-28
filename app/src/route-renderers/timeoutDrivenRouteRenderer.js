define(['app/app.settings'], (appSettings) => {
    'use strict';

    const settings = appSettings.camera;

    return class TimeoutDrivenRouteRenderer {
        constructor(segmentRenderer) {
            this._segmentRenderer = segmentRenderer;
        }

        draw(segmentGenerator) {
            let intervalId = setInterval(function () {
                try {
                    if (!segmentGenerator.moveToNext()) {
                        clearInterval(intervalId);
                        intervalId = null;
                        return;
                    }
                    this._segmentRenderer.addPath(segmentGenerator.getSegment());
                }
                catch (e) {
                    console.log(e);
                }
            }, settings.FRAME_DURATION);
        }
    };
});