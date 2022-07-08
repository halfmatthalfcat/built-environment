import { FC, useCallback, useContext, useEffect, useRef } from 'react';
import Map, { RasterLayer, FillExtrusionLayer, MapboxEvent, MapRef, ViewStateChangeEvent } from 'react-map-gl';
import { ThemeColor, ThemeContext } from '../util/ThemeProvider';
import { MapContext } from '../util/MapContextProvider';
import { AnySourceData } from 'mapbox-gl';

interface Props {
  isLoading?: boolean;
  toggleLoading?: (loading: boolean) => void;
}

const satelliteSourceId = 'satellite-source';
const satelliteSource: AnySourceData = {
  id: satelliteSourceId,
  type: 'raster',
  url: 'mapbox://mapbox.satellite',
  tileSize: 256,
};

const satelliteLayerId = 'satellite-layer';
const satelliteLayer = {
  id: satelliteLayerId,
  source: satelliteSourceId,
  type: 'raster',
} as RasterLayer;

const extrusionLayerId = 'building-extrusions';
const extrusionLayer = (mapStyle: ThemeColor) => ({
  id: extrusionLayerId,
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 15,
  paint: {
    'fill-extrusion-color': mapStyle === 'light' ? '#aaa' : '#000',
    'fill-extrusion-height': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'height'],
    ],
    'fill-extrusion-base': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'min_height'],
    ],
    'fill-extrusion-opacity': 0.6,
  },
} as FillExtrusionLayer);

export const Mapbox: FC<Props> = ({ toggleLoading, isLoading }) => {
  const {
    updateMapContext,
    extrusions,
    coords,
    satellite,
    mapStyle,
  } = useContext(MapContext);
  const { color: themeColor } = useContext(ThemeContext);
  const map = useRef<MapRef | null>(null);

  const onMove = useCallback(({ viewState }: ViewStateChangeEvent) => {
    updateMapContext({
      coords: viewState,
    });
  }, []);

  // When the style is changed, remove all the labels
  const onMapLoad = useCallback((e: MapboxEvent) => {
    if (map.current) {
      const localMap = map.current.getMap();
      localMap.getStyle().layers.forEach(layer => {
        if (layer.type === 'symbol' && layer.id.includes('label')) {
          localMap.removeLayer(layer.id);
        }
      });
      loadExtrusions(extrusions);
      loadSatelliteLayer(satellite);
    }
    toggleLoading?.(false);
  }, [ toggleLoading, extrusions, satellite ]);

  const loadExtrusions = useCallback((extrusions: boolean) => {
    if (map.current) {
      const localMap = map.current.getMap();
      const layers = localMap.getStyle().layers;
      const hasSatelliteLayerApplied = layers.some(layer => layer.id === satelliteLayerId);
      const hasExtrusionsApplied = layers.some(layer => layer.id === extrusionLayerId);

      if (extrusions && !hasExtrusionsApplied) {
        const builtExtrusionLayer = extrusionLayer(themeColor);
        const isWithinZoom = builtExtrusionLayer.minzoom
          ? localMap.getZoom() >= builtExtrusionLayer.minzoom
          : true;

        localMap.addLayer(builtExtrusionLayer, hasSatelliteLayerApplied ? satelliteLayerId : void 0);
        // Set the zoom to the minzoom to see extrusions
        if (!isWithinZoom && builtExtrusionLayer.minzoom != null) {
          map.current?.setZoom(builtExtrusionLayer.minzoom);
          map.current?.flyTo({
            speed: .5,
            zoom: builtExtrusionLayer.minzoom,
          });
        }
      } else if (!extrusions && hasExtrusionsApplied) {
        localMap.removeLayer(extrusionLayerId);
      }
    }
  }, [ themeColor ]);

  const loadSatelliteLayer = useCallback((satellite: boolean) => {
    if (map.current) {
      const localMap = map.current.getMap();
      const layers = localMap.getStyle().layers;
      const hasSatelliteSourceApplied = map.current.isSourceLoaded(satelliteSourceId);
      const hasSatelliteLayerApplied = layers.some(layer => layer.id === satelliteLayerId);

      if (satellite && !hasSatelliteLayerApplied) {
        if (!hasSatelliteSourceApplied) {
          localMap.addSource(satelliteSourceId, satelliteSource);
        }
        localMap.addLayer(satelliteLayer, layers[layers.length - 1].id)
      } else if (!satellite && hasSatelliteLayerApplied) {
        localMap.removeLayer(satelliteLayerId);
      }
    }
  }, []);

  // Whenever the style is changed, hide behind loading until we're done
  useEffect(() => {
    toggleLoading?.(true);
  }, [ mapStyle ]);

  // Whenever we toggle extrusions
  useEffect(() => loadExtrusions(extrusions), [ loadExtrusions, extrusions ]);

  // Whenever we toggle the satellite overlay
  useEffect(() => loadSatelliteLayer(satellite), [ loadSatelliteLayer, satellite ]);

  return (
    <Map
      {...coords}
      ref={map}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_GL_ACCESS_TOKEN}
      mapStyle={mapStyle}
      onMove={onMove}
      onStyleData={onMapLoad}
      onError={console.log}
      antialias={true}
    ></Map>
  );
};
