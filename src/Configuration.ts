import { readable } from 'svelte/store';

import type { ProviderFactory } from './providers/Provider';
import { Location } from './providers/Location';
import { OpenMeteoProvider } from './providers/OpenMeteoProvider';
import { ProviderFactories } from './providers';

export enum Units {
  Imperial,
  Metric,
}

export interface Configuration {
  providerFactory: ProviderFactory;
  providerParams: object;
  location: Location | undefined;
  units: Units;
  layout: string;
  title: string;
  refreshInterval: number;
}

const DEFAULT_CONFIGURATION: Configuration = {
  providerFactory: OpenMeteoProvider,
  providerParams: {},
  location: undefined,
  units: new Intl.Locale(window.navigator.language).region === 'US' ? Units.Imperial : Units.Metric,
  layout: 'horizontal',
  title: '',
  refreshInterval: 2 * 3600,
};

export function decodeConfiguration(params: object): Configuration {
  const providerFactory = ProviderFactories.find((e) => e.id === params['provider']) || DEFAULT_CONFIGURATION.providerFactory;
  const providerParams = Object.fromEntries(providerFactory.fields.map((f: { name: string }) => [f.name, params[f.name] || undefined]));
  const location = Location.fromString(params['location']) || DEFAULT_CONFIGURATION.location;
  const layout = params['layout'] || DEFAULT_CONFIGURATION.layout;
  const title = params['title'] || DEFAULT_CONFIGURATION.title;
  const units = params['units'] === 'metric' ? Units.Metric : params['units'] === 'imperial' ? Units.Imperial : DEFAULT_CONFIGURATION.units;
  const refreshInterval = parseInt(params['refresh_interval']) || DEFAULT_CONFIGURATION.refreshInterval;

  return {
    providerFactory,
    providerParams,
    location,
    layout,
    title,
    units,
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
  if (configuration.title !== DEFAULT_CONFIGURATION.title) {
    params['title'] = configuration.title;
  }
  if (configuration.layout !== DEFAULT_CONFIGURATION.layout) {
    params['layout'] = configuration.layout;
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
