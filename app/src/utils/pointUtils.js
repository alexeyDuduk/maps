(function () {
    "use strict";

    require([], () => {
        class PointUtils {
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
        }

        window.EM.PointUtils = PointUtils;
    });
})();