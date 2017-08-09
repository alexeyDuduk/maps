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
                prevPoint = points[index - 1];
                let x1 = prevPoint[0],
                    y1 = prevPoint[1],
                    x2 = point[0],
                    y2 = point[1];

                return total + (Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) || 0);
            }, 0);

            return result;
        }
    };
});
