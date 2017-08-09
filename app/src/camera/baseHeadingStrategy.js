define([
    'app/app.settings'
],
    (settings) => {
    'use strict';

    return class BaseHeadingStrategy {
        constructor(segmentGenerator) {
            this._latSum = 0;
            this._lngSum = 0;
            this._count = 0;
            this._segmentsToRemember = Math.ceil(
                settings.camera.HEADING_TARGET_POINTS_COUNT / segmentGenerator.getPointsCountInSegment()
            );
            this._pointsCache = [];
        }

        update(point) {
            this._rememberPoint(point);
            if (this._count > this._segmentsToRemember) {
                this._forgetFirstPoint();
            }
        }

        getInitialHeading(point) {
            return this._getHeading(point);
        }

        getRouteHeading(point) {
            return this._getHeading(point) + 90;
        }

        _getHeading(point) {
            let averagePoint = [ this._latSum / this._count, this._lngSum / this._count ];
            let heading = 0;
            if (this._count > 2) {
                let dy = averagePoint[1] - point[1];
                let dx = averagePoint[0] - point[0];
                let tg = dx / dy;
                heading = Math.atan(tg) * 180 / Math.PI;
                if (dy < 0) {
                    heading += 180;
                } else if (dx < 0) {
                    heading += 360;
                }
            }

            return heading;
        }

        _rememberPoint(point) {
            this._pointsCache.push(point);
            this._latSum += point[0];
            this._lngSum += point[1];
            this._count++;
        }

        _forgetFirstPoint() {
            let point = this._pointsCache.shift();
            this._latSum -= point[0];
            this._lngSum -= point[1];
            this._count--;
        }
    };
});