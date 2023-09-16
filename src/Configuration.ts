import { readable } from 'svelte/store';

import type { ProviderFactory } from './providers/Provider';
import { Location } from './providers/Location';
import { OpenMeteoProvider } from './providers/OpenMeteoProvider';
import { ProviderFactories } from './providers';

export enum StorageMode {
  QueryString,
  LocalStorage,
}

export enum Units {
  Imperial,
  Metric,
}

export enum AutoExpand {
  Today,
  All,
  None,
}

export interface Configuration {
  providerFactory: ProviderFactory;
  providerParams: { [key: string]: string };
  location: Location | undefined;
  units: Units;
  autoexpand: AutoExpand;
  title: string;
  refreshInterval: number;
  showHourlyPrecipitation: boolean;
  showHourlyWind: boolean;
}

const DEFAULT_CONFIGURATION: Configuration = {
  providerFactory: OpenMeteoProvider,
  providerParams: {},
  location: undefined,
  units: new Intl.Locale(window.navigator.language).region === 'US' ? Units.Imperial : Units.Metric,
  autoexpand: AutoExpand.None,
  title: '',
  refreshInterval: 2 * 3600,
  showHourlyPrecipitation: true,
  showHourlyWind: true,
};

function decodeConfiguration(params: { [key: string]: string }): Configuration {
  const providerFactory = ProviderFactories.find((e) => e.id === params['provider']) || DEFAULT_CONFIGURATION.providerFactory;
  const providerParams = Object.fromEntries(providerFactory.fields.map((f: { name: string }) => [f.name, params[f.name]]));
  const location = Location.fromString(params['location']) || DEFAULT_CONFIGURATION.location;
  const title = params['title'] || DEFAULT_CONFIGURATION.title;
  const units = params['units'] === 'metric' ? Units.Metric : params['units'] === 'imperial' ? Units.Imperial : DEFAULT_CONFIGURATION.units;
  const autoexpand =
    params['autoexpand'] === 'today'
      ? AutoExpand.Today
      : params['autoexpand'] === 'all'
      ? AutoExpand.All
      : params['autoexpand'] === 'none'
      ? AutoExpand.None
      : DEFAULT_CONFIGURATION.autoexpand;
  const refreshInterval = parseInt(params['refresh_interval']) || DEFAULT_CONFIGURATION.refreshInterval;
  const showHourlyPrecipitation =
    params['hourly_precipitation'] === undefined ? DEFAULT_CONFIGURATION.showHourlyPrecipitation : params['hourly_precipitation'] === 'true' ? true : false;
  const showHourlyWind = params['hourly_wind'] === undefined ? DEFAULT_CONFIGURATION.showHourlyWind : params['hourly_wind'] === 'true' ? true : false;

  return {
    providerFactory,
    providerParams,
    location,
    title,
    units,
    autoexpand,
    refreshInterval,
    showHourlyPrecipitation,
    showHourlyWind,
  };
}

function encodeConfiguration(configuration: Configuration): object {
  const params: { [key: string]: string } = {};

  params['provider'] = configuration.providerFactory.id;
  for (const field of configuration.providerFactory.fields) {
    if (configuration.providerParams[field.name] !== undefined) {
      params[field.name] = configuration.providerParams[field.name];
    }
  }
  if (configuration.location !== undefined && configuration.location !== DEFAULT_CONFIGURATION.location) {
    params['location'] = configuration.location.toString();
  }
  if (configuration.units !== DEFAULT_CONFIGURATION.units) {
    params['units'] = configuration.units === Units.Metric ? 'metric' : 'imperial';
  }
  if (configuration.autoexpand !== DEFAULT_CONFIGURATION.autoexpand) {
    params['autoexpand'] = configuration.autoexpand === AutoExpand.Today ? 'today' : configuration.autoexpand === AutoExpand.All ? 'all' : 'none';
  }
  if (configuration.title !== DEFAULT_CONFIGURATION.title) {
    params['title'] = configuration.title;
  }
  if (configuration.refreshInterval !== DEFAULT_CONFIGURATION.refreshInterval) {
    params['refresh_interval'] = configuration.refreshInterval.toString();
  }
  if (configuration.showHourlyPrecipitation !== DEFAULT_CONFIGURATION.showHourlyPrecipitation) {
    params['hourly_precipitation'] = configuration.showHourlyPrecipitation.toString();
  }
  if (configuration.showHourlyWind !== DEFAULT_CONFIGURATION.showHourlyWind) {
    params['hourly_wind'] = configuration.showHourlyWind.toString();
  }

  return params;
}

export function getStorageMode(): StorageMode {
  return new URLSearchParams(window.location.search).get('storage') === 'local' ? StorageMode.LocalStorage : StorageMode.QueryString;
}

export function loadConfiguration(): Configuration {
  const storageMode = getStorageMode();

  if (storageMode === StorageMode.QueryString) {
    return decodeConfiguration(Object.fromEntries(new URLSearchParams(window.location.search).entries()));
  } else {
    return decodeConfiguration(JSON.parse(window.localStorage.getItem('configuration') || '{}'));
  }
}

export function storeConfiguration(configuration: Configuration): void {
  const storageMode = getStorageMode();

  if (storageMode === StorageMode.QueryString) {
    window.location.search = new URLSearchParams(encodeConfiguration(configuration) as Record<string, string>).toString();
  } else {
    window.localStorage.setItem('configuration', JSON.stringify(encodeConfiguration(configuration)));
    window.location.search = new URLSearchParams({ storage: 'local' }).toString();
  }
}

export const configuration = readable(DEFAULT_CONFIGURATION, function start(set) {
  set(loadConfiguration());
  return () => {};
});
