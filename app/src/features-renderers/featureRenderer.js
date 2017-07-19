(function () {
    "use strict";

    require([
        'esri/Graphic',
        'esri/geometry/Point',
        'esri/symbols/PointSymbol3D',
        'esri/symbols/IconSymbol3DLayer',
        'esri/symbols/callouts/LineCallout3D',
        'esri/layers/FeatureLayer',
        'esri/renderers/UniqueValueRenderer'
    ], (Graphic,
        Point,
        PointSymbol3D,
        IconSymbol3DLayer,
        LineCallout3D,
        FeatureLayer,
        UniqueValueRenderer
    ) => {
        const colors = window.EM.settings.colors;
        const assets = window.EM.settings.assets;

        const ICON_VERTICAL_OFFSET = {
            screenLength: 150,
            maxWorldLength: 5000,
            minWorldLength: 50
        };

        let id = 0;

        class FeatureRenderer {
            constructor (map) {
                let iconTypes   = ['pickup', 'delivery'];
                this._layer     = this._createLayer(map, iconTypes);
            }

            draw (features) {
                let data = _.map(features, (feature) => ({
                        geometry: new Point({
                            latitude: feature.geometry[1],
                            longitude: feature.geometry[0]
                        }),
                        attributes: _.clone(feature)
                    })
                );

                this._layer.source.addMany(data);
            }

            _createLayer (map, symbolTypes) {
                let symbols = _.map(symbolTypes, (type) => ({
                    value: type,
                    symbol: this._createIconSymbol(type)
                }));
                let renderer = new UniqueValueRenderer({
                    field: 'type',
                    uniqueValueInfos: symbols
                });
                let layer = this._createFeatureLayer(renderer);
                map.layers.add(layer);

                return layer;
            }

            _createFeatureLayer (renderer) {
                return new FeatureLayer({
                    renderer: renderer,
                    id: this._generateId(),
                    source: [],
                    fields: [
                        {
                            name: 'id',
                            alias: 'Id',
                            type: 'oid'
                        },
                        {
                            name: 'type',
                            alias: 'Type',
                            type: 'string'
                        }
                    ],
                    elevationInfo: {
                        mode: 'relative-to-scene'
                    },
                    objectIdField: "id",
                    geometryType: "point",
                    spatialReference: {
                        wkid: 4326
                    },
                    title: 'Locations layer',
                    featureReduction: {
                        type: 'selection'
                    }
                });
            }

            _createIconSymbol (type) {
                let assetType = _.toUpper(type);

                return new PointSymbol3D({
                    symbolLayers: [
                        new IconSymbol3DLayer({
                            resource: {
                                href: assets.LOCATION_PIN[assetType]
                            },
                            size: 25
                        })
                    ],
                    verticalOffset: ICON_VERTICAL_OFFSET,
                    callout: new LineCallout3D({
                        size: 2,
                        color: 'white'
                    })
                });
            }

            _generateId() {
                return ++id;
            }
        }

        window.EM.FeatureRenderer = FeatureRenderer;
    });
})();