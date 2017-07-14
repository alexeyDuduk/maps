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

        class FeatureRenderer {
            constructor(map) {
                let renderer = new UniqueValueRenderer({
                    field: 'type',
                    uniqueValueInfos: _.map(['pickup', 'delivery'], (type) => ({
                        value: type,
                        symbol: this._createSymbol(type)
                    }))
                });
                this._layer = new FeatureLayer({
                    renderer: renderer,
                    id: 11111,
                    source: [],
                    fields: [{
                        name: 'id',
                        alias: 'Id',
                        type: 'oid'
                    },
                    {
                        name: 'type',
                        alias: 'Type',
                        type: 'string'
                    }],
                    elevationInfo: {
                        mode: 'relative-to-scene'
                    },
                    objectIdField: "id",
                    geometryType: "point",
                    spatialReference: { wkid: 4326 },
                    title: 'Locations layer',
                    featureReduction: {
                        type: 'selection'
                    }
                });
                map.layers.add(this._layer);
            }

            draw(features) {
                this._layer.source.addMany(_.map(features, (feature) => ({
                        geometry: new Point({
                            latitude: feature.geometry[1],
                            longitude: feature.geometry[0]
                        }),
                        attributes: feature
                    })
                ));
            }

            _createSymbol(type) {
                return new PointSymbol3D({
                    symbolLayers: [
                        new IconSymbol3DLayer({
                            resource: {
                                primitive: 'circle'
                            },
                            material: {
                                color: 'white'
                            },
                            outline: {
                                color: colors.LOCATIONS[type],
                                size: 1
                            },
                            size: 20,
                        }),
                        new IconSymbol3DLayer({
                            resource: {
                                href: assets.LOCATION_PIN
                            },
                            material: {
                                color: colors.LOCATIONS[type]
                            },
                            size: 15,
                        })
                    ],
                    verticalOffset: {
                        screenLength: 40,
                        maxWorldLength: 200,
                        minWorldLength: 35
                    },
                    callout: new LineCallout3D({
                        size: 2,
                        color: 'white',
                        border: {
                            color: 'white'
                        }
                    })
                });
            }
        }

        window.EM.FeatureRenderer = FeatureRenderer;
    });
})();