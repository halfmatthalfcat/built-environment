import type { NextPage } from 'next';
import {
  Button,
  Checkbox,
  CheckboxProps,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Grid, Icon, Input,
  Menu,
  Segment,
} from 'semantic-ui-react';
import { createUseStyles } from 'react-jss';
import clsx from 'clsx';
import { Mapbox } from '../components/map';
import { ChangeEvent, SyntheticEvent, useCallback, useContext, useRef, useState } from 'react';
import { ThemeColor, ThemeContext } from '../util/ThemeProvider';
import { MapContext } from '../util/MapContextProvider';
import { storeFile } from '../util/idb';

const useStyles = createUseStyles({
  grid: {
    padding: '10px!important',
  },
  flexed: {
    flex: 1,
    height: '100%',
    display: 'flex',
  },
  menu: {
    borderBottom: 'none',
  },
  map: {
    flexBasis: '75%!important'
  },
  collection: {
    flexBasis: '25%!important'
  },
  marginUnset: {
    marginTop: 'unset!important',
    marginBottom: 'unset!important',
  },
  paddingUnset: {
    paddingTop: 'unset!important',
    paddingBottom: 'unset!important',
  },
  light: {
    background: '#fff',
  },
  dark: {
    background: '#000',
  },
  checkbox: {
    '&.inverted label': {
      color: 'rgba(255,255,255,.5)!important',
    },
    '& label': {
      color: 'rgba(0,0,0,.5)!important',
      paddingLeft: 'unset!important',
    },
    '& label:before': {
      width: '12px!important',
      height: '12px!important',
      left: 'unset!important',
      right: 0,
    },
    '& label:after': {
      width: '12px!important',
      height: '12px!important',
      left: 'unset!important',
      right: 0,
      fontSize: '12px!important',
    },
  },
});

const options: Array<DropdownItemProps> = [{
  key: 'dark',
  value: 'dark',
  text: 'Dark',
}, {
  key: 'light',
  value: 'light',
  text: 'Light',
}];

const mapStyleMap: Record<string, string> = {
  light: 'mapbox://styles/mapbox/light-v10',
  dark: 'mapbox://styles/mapbox/dark-v10',
  outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  streets: 'mapbox://styles/mapbox/streets-v11'
};

const Home: NextPage = () => {
  const classes = useStyles();
  const theme = useContext(ThemeContext);
  const fileInput = useRef<HTMLInputElement>(null);
  const {
    updateMapContext,
    extrusions,
    satellite,
    files,
  } = useContext(MapContext);
  const [mapLoading, setMapLoading] = useState(true);

  const onSelectChange = useCallback((event: SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    theme.changeTheme(value as ThemeColor);
    updateMapContext({
      mapStyle: mapStyleMap[value as string],
    });
  }, []);

  const onShowExtrusions = useCallback((event: SyntheticEvent<HTMLInputElement, Event>, { checked }: CheckboxProps) => {
    updateMapContext({
      extrusions: !!checked,
    });
  }, []);

  const onSatelliteOverlay = useCallback((event: SyntheticEvent<HTMLInputElement, Event>, { checked }: CheckboxProps) => {
    updateMapContext({
      satellite: !!checked,
    });
  }, []);

  const onMapLoading = useCallback(setMapLoading, []);

  const onFileRequested = useCallback(() => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  }, []);

  const onFilesSelected = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    Array.from(event.target.files ?? []).forEach(file => {
      const name = file.name.split('.obj')[0];
      if (!files[name]) {
        storeFile(name, file)
          .then(() => updateMapContext(({ coords: { latitude, longitude }}) => ({
            files: {
              [name]: {
                latitude,
                longitude,
              },
            },
          })))
          .catch(console.log)
      }
    });
  }, [ files ]);

  return (
    <Grid
      className={clsx(
        classes.flexed,
        classes.marginUnset,
        classes.grid,
        theme.color === 'light' ? classes.light : classes.dark,
      )}
      {...theme.semantic}
    >
      <Grid.Row className={clsx(classes.marginUnset, classes.paddingUnset)}>
        <Grid.Column width={3}>
          <Menu vertical={true} fluid={true} {...theme.semantic}>
            <Menu.Item header={true}>
              Our Built Environment
            </Menu.Item>
            <Menu.Item>
              <Menu.Header>Options</Menu.Header>
              <Menu.Menu>
                <Dropdown
                  {...theme.semantic}
                  item
                  value={theme.color}
                  onChange={onSelectChange}
                  options={options}
                  text='Theme'
                  direction='right'
                  pointing='left'
                />
                <Checkbox
                  className={clsx(
                    'item',
                    classes.checkbox,
                    theme.color === 'light' ? void 0 : 'inverted',
                  )}
                  label='Satellite Overlay'
                  fitted={true}
                  checked={satellite}
                  onChange={onSatelliteOverlay}
                />
                <Checkbox
                  className={clsx(
                    'item',
                    classes.checkbox,
                    theme.color === 'light' ? void 0 : 'inverted',
                  )}
                  label='Show Extrusions'
                  fitted={true}
                  checked={extrusions}
                  onChange={onShowExtrusions}
                />
              </Menu.Menu>
            </Menu.Item>
            <Menu.Item>
              <Menu.Header>Objects</Menu.Header>
              <Menu.Menu>
                <Menu.Item name='addObject' onClick={onFileRequested}>
                  <Icon name='plus' />
                  Add Object
                  <input
                    type='file'
                    ref={fileInput}
                    style={{ display: 'none' }}
                    accept='.obj'
                    onChange={onFilesSelected}
                  />
                </Menu.Item>
              </Menu.Menu>
            </Menu.Item>
            <Menu.Item>
              <Menu.Header>Points</Menu.Header>
              <Menu.Menu>
                <Menu.Item name='addPoint' onClick={() => void 0}>
                  <Icon name='plus' />
                  Add Point
                </Menu.Item>
              </Menu.Menu>
            </Menu.Item>
          </Menu>
        </Grid.Column>
        <Grid.Column width={13}>
          <Segment className={clsx(classes.flexed, classes.map)} loading={mapLoading} {...theme.semantic}>
            <Mapbox isLoading={mapLoading} toggleLoading={onMapLoading} />
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default Home
