import './styles.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'semantic-ui-css/semantic.min.css'
import type { AppProps } from 'next/app'
import ThemeProvider from '../util/ThemeProvider';
import MapContextProvider from '../util/MapContextProvider';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider>
      <MapContextProvider>
        <Component {...pageProps} />
      </MapContextProvider>
    </ThemeProvider>
  );
};

export default MyApp
