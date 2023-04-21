import { readable } from 'svelte/store';

import type { ProviderFactory } from './providers/Provider';
import { Location } from './providers/Location';
import { OpenMeteoProvider } from './providers/OpenMeteoProvider';
import { ProviderFactories } from './providers';

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
  providerParams: object;
  location: Location | undefined;
  units: Units;
  autoexpand: AutoExpand;
  title: string;
  refreshInterval: number;
}

const DEFAULT_CONFIGURATION: Configuration = {
  providerFactory: OpenMeteoProvider,
  providerParams: {},
  location: undefined,
  units: new Intl.Locale(window.navigator.language).region === 'US' ? Units.Imperial : Units.Metric,
  autoexpand: AutoExpand.None,
  title: '',
  refreshInterval: 2 * 3600,
};

export function decodeConfiguration(params: object): Configuration {
  const providerFactory = ProviderFactories.find((e) => e.id === params['provider']) || DEFAULT_CONFIGURATION.providerFactory;
  const providerParams = Object.fromEntries(providerFactory.fields.map((f: { name: string }) => [f.name, params[f.name] || undefined]));
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

  return {
    providerFactory,
    providerParams,
    location,
    title,
    units,
    autoexpand,
    refreshInterval,
  };
}

export function encodeConfiguration(configuration: Configuration): object {
  const params = {};

  params['provider'] = configuration.providerFactory.id;
  for (const field of configuration.providerFactory.fields) {
    if (configuration.providerParams[field.name] !== undefined) {
      params[field.name] = configuration.providerParams[field.name];
    }
  }
  if (configuration.location !== DEFAULT_CONFIGURATION.location) {
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
    params['refresh_interval'] = configuration.refreshInterval;
  }

  return params;
}

export const configuration = readable(DEFAULT_CONFIGURATION, function start(set) {
  const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  set(decodeConfiguration(urlParams));
  return () => {};
});
