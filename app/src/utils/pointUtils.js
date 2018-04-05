define([], () => {
    'use strict';

    return class PointUtils {
        static fillWithIntermediatePoints(points, bits) {
            let result = [];

            points.forEach(function (item, index) {
                if (!index) {
                    result.push(item);
                    return;
                }
                let bitIndex = 1;
                let previousItem = points[index - 1];
                let kx = item[0] - previousItem[0];
                let ky = item[1] - previousItem[1];

                while (bitIndex <= bits) {
                    let ratio = bitIndex / bits;

                    result.push([
                        previousItem[0] + kx * ratio,
                        previousItem[1] + ky * ratio
                    ]);
                    bitIndex++;
                }
            });

            return result;
        }

        static generateRandomPoint() {
            let latMin = -90;
            let latMax = 90;
            let longMin = -180;
            let longMax = 180;

            return [PointUtils.randomFromRange(longMin, longMax), PointUtils.randomFromRange(latMin, latMax)];
        }

        static randomFromRange(from, to) {
            return Math.random() * (to - from) + from;
        }

        static findPointIndex(point, points) {
            let x = point[0];
            let y = point[1];
            let comparator = el => el[0] === x && el[1] === y;

            if (Array.prototype.findIndex) {
                return (points || []).findIndex(comparator);
            } else {
                let item = ((points || []).filter(comparator) || [])[0];
                return points.indexOf(item);
            }
        }

        static getPathLength (points) {
            let prevPoint;
            let result = points.reduce((total, point, index) => {
                if (index === 0) {
                    return total;
                }

                return total + (PointUtils.getDistance(points[index - 1], point) || 0);
            }, 0);

            return result;
        }

        static getDistance(point1, point2) {
            return Math.sqrt(
                Math.pow(point1[0] - point2[0], 2) +
                Math.pow(point1[1] - point2[1], 2)
            );
        }
    };
});
