define([
    'app/vendor/simplify',
    'app/app.settings',
    'app/utils/pointUtils',
    'app/camera/baseHeadingStrategy',
], (simplify, settings, PointUtils, BaseHeadingStrategy) => {
    'use strict';

    return class CameraProvider {
        constructor(segmentGenerator, specialPoints) {
            // TODO
            this._headingStrategy = new BaseHeadingStrategy(segmentGenerator);
            this._segmentGenerator = segmentGenerator;

            this._initCoefficients();

            this._epsilon = 0.3;
            this._specialPoints = this._getSpecialPoints(specialPoints);
            this._interpolatedPoints = this.getInterpolatedPointsSet();
            this._lastMinRatio = Infinity;
            this._prevPoint = null;
            this._nextPoint = null;


            this._initZoom();
        }

        _initCoefficients() {
            this._scaleSegmentsCount = Math.ceil(
                settings.camera.SCALE_TARGET_POINTS_COUNT / this._segmentGenerator.getPointsCountInSegment()
            );
            this._pointsCountBefore = Math.ceil(
                this._scaleSegmentsCount * settings.camera.SCALE_TARGET_POINTS_RATIO
            );
            this._pointsCountAfter = this._scaleSegmentsCount - this._pointsCountBefore;
        }

        getInitialCamera() {
            let point = this._segmentGenerator.getInitialPoint();

            return {
                center: point,
                zoom: this._getZoomLevel(point),
                tilt: settings.camera.INITIAL_TILT,
                heading: this._headingStrategy.getInitialHeading(point)
            };
        }

        getCamera() {
            let point = this._interpolatedPoints[this._segmentGenerator.getCurrentPointIndex() + this._pointsCountBefore];
            if (!point) {
                debugger;
            }
            this._headingStrategy.update(point);

            return {
                target: point,
                zoom: this._getZoomLevel(point),
                tilt: settings.camera.ROUTE_TILT,
                fov: settings.camera.FOV,
                heading: this._headingStrategy.getRouteHeading(point)
            };
        }

        getTotalViewCamera() {
            return {
                target: this._segmentGenerator.getPoints(),
                tilt: settings.camera.TOTAL_VIEW_TILT
            };
        }

        _getSpecialPoints(specialPoints) {
            _.first(specialPoints).visited = true;
            return specialPoints;
            let points = this._segmentGenerator.getPoints();
            let result = [{
                geometry: _.first(points),
                visited: true
            }];
            if (specialPoints && specialPoints.length) {
                result.push.apply(result, specialPoints);
            }
            result.push({
                geometry: _.last(points)
            });
            console.log('specialPoints', result);

            return result;
        }

        _initZoom() {
            this._prevPoint = this._specialPoints[0];
            this._nextPoint = this._specialPoints[1];
            this._nextPointIndex = 1;
        }

        _getZoomLevel(currentPoint) {
            let maxZoom = 13;
            let minZoom = settings.camera.DEFAULT_ZOOM;

            if (!this._specialPoints.length) {
                return minZoom;
            }

            let totalDistance = PointUtils.getDistance(this._prevPoint.geometry, this._nextPoint.geometry);
            if (!totalDistance) {
                return minZoom;
            }
            let distanceToPrev = PointUtils.getDistance(this._prevPoint.geometry, currentPoint);
            let distanceToNext = PointUtils.getDistance(currentPoint, this._nextPoint.geometry);

            let distance = Math.min(distanceToPrev, distanceToNext);
            let ratio = distance / totalDistance;
            if (ratio > this._epsilon) {
                return minZoom;
            }

            if (ratio < this._lastMinRatio) {
                this._lastMinRatio = ratio;
            }
            else if (distanceToPrev > distanceToNext) {
                this._lastMinRatio = Infinity;
                this._nextPoint.visited = true;
                this._prevPoint = this._nextPoint;
                this._nextPoint = this._specialPoints[++this._nextPointIndex];
            }

            return maxZoom + ratio / this._epsilon * (minZoom - maxZoom);
        }

        // return array of points for interpolated route
        // get array of points for interpolated route from 'simplify'
        // find common points
        // split interpolated path on the same number of points as original path
        // TODO: review the possibility of duplicated points, indexes can be incorrect in this case
        // TODO: camera specific logic
        getInterpolatedPointsSet(count) {
            let originalPoints = this._mapWithBufferPoints(
                this._segmentGenerator.getPoints().slice(0, count)
            );
            //return this._smooth(originalPoints);

            return _.chain(this._findRanges(originalPoints))
                .map((range, i, arr) =>  {
                    console.log('ranges =', arr);
                    return this._smooth(originalPoints.slice(range.from, range.count));
                })
                .flatten()
                .value();
        }

        _findRanges(originalPoints) {
            let specialPointIndex = 0;
            let lastMinDistance = Infinity;
            let specialPoints = this._specialPoints;
            let distanceToNextSpecialPoint = PointUtils.getDistance(
                specialPoints[0].geometry,
                specialPoints[1].geometry
            );
            let eps = 0.2;

            return _.chain(originalPoints)
                // find indexes of original points that are the closest to specialPoints
                // returns array of indexes
                .reduce((memo, point, pointIndex) => {
                    if (specialPointIndex >= specialPoints.length) {
                        return memo;
                    }

                    let distance = PointUtils.getDistance(point, specialPoints[specialPointIndex].geometry);
                    if (distance <= distanceToNextSpecialPoint * eps) {
                        if (distance <= lastMinDistance) {
                            lastMinDistance = distance;
                        }
                        else {
                            lastMinDistance = Infinity;
                            memo.push(pointIndex);
                            specialPointIndex++;
                            if (specialPointIndex < specialPoints.length) {
                                distanceToNextSpecialPoint = PointUtils.getDistance(
                                    specialPoints[specialPointIndex - 1].geometry,
                                    specialPoints[specialPointIndex].geometry
                                );
                            }
                        }
                    }

                    return memo;
                }, [])
                // map these indexes to ranges, so path will be divided by (indexes.length - 1) parts
                .map((indexValue, index, arr) => {
                    console.log('map arr = ', arr);
                    if (index === arr.length - 1) {
                        return null;
                    }

                    return {
                        from: indexValue,
                        count: arr[index + 1] - indexValue + 1
                    };
                })
                .filter(range => range)
                .value();
        }

        _smooth(originalPoints) {
            let points = originalPoints.map(pair => ({ x: pair[0], y: pair[1] }));

            points = simplify(points, settings.camera.INTERPOLATION_PRECISION, true);
            points = points.map(point => [point.x, point.y]);

            let filledPoints = points.reduce((result, point, index) => {
                if (!index) {
                    return result;
                }
                let count = PointUtils.findPointIndex(point, originalPoints) - result.length;
                return result.concat(PointUtils.fillWithIntermediatePoints([points[index - 1], point], count));
            }, []);

            console.log('filledPoints', filledPoints);
            return filledPoints;
        }

        _mapWithBufferPoints(points) {
            // Add 2 buffers of points: before the first and after the last
            return _.concat(
                this._reflectPoints(points.slice(0, this._pointsCountBefore), _.first(points)),
                points,
                this._reflectPoints(points.slice(-this._pointsCountAfter), _.last(points))
            );
        }

        _reflectPoints(points, origin) {
            return _.chain(points)
                .map((point) => [
                    2 * origin[0] - point[0],
                    2 * origin[1] - point[1]
                ])
                .value()
                .reverse();
        }
    };
});
