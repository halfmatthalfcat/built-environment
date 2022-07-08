/**
 * We want to store the current map state and persist it
 */
import { createContext, FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { DeepPartial, deepUpdate } from './obj';

type UpdateMapContext = Omit<DeepPartial<MapContext>, 'updateMapContext'>;
type UpdateMapContextFn = (current: Omit<MapContext, 'updateMapContext'>) => UpdateMapContext;

interface MapContext {
  readonly updateMapContext: (context: UpdateMapContext | UpdateMapContextFn) => void;
  coords: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  files: {
    [fileName: string]: {
      longitude: number;
      latitude: number;
    };
  },
  mapStyle: string;
  satellite: boolean;
  extrusions: boolean;
}

const contextStorageKey: string = 'built-environment-state';
const defaultContext: MapContext = {
  updateMapContext: () => void 0,
  // Default coords are the Wrigley Building
  coords: {
    longitude: -87.62441813885201,
    latitude: 41.89104578239103,
    zoom: 13.5,
  },
  files: {},
  mapStyle: 'mapbox://styles/mapbox/light-v10',
  satellite: false,
  extrusions: false,
};
export const MapContext = createContext<MapContext>(defaultContext);

const MapContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const updateMapContext = useCallback((context: UpdateMapContext | UpdateMapContextFn) => {
    setContext(current => deepUpdate(
      typeof context === 'function' ? context(current) : context,
      current,
    ));
  }, []);
  const [context, setContext] = useState<MapContext>({
    ...defaultContext,
    updateMapContext,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const localStorageContext = localStorage.getItem(contextStorageKey);
    if (localStorageContext) {
      try {
        const parsedContext = JSON.parse(localStorageContext);
        setContext({
          ...parsedContext,
          updateMapContext,
        });
      } catch {
        setContext({
          ...defaultContext,
          updateMapContext,
        });
      }
    } else {
      setContext({
        ...defaultContext,
        updateMapContext,
      });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (context && loaded) {
      const { updateMapContext: _, ...rest } = context;
      localStorage.setItem(contextStorageKey, JSON.stringify(rest));
    }
  }, [ context ]);

  return (
    <MapContext.Provider value={context}>
      { loaded ? children : null }
    </MapContext.Provider>
  );
};

export default MapContextProvider;
