import type { ProviderFactory } from './Provider';

/* Providers */
import { ExampleProvider } from './ExampleProvider';
import { WeatherFlowProvider } from './WeatherFlowProvider';
import { VisualCrossingProvider } from './VisualCrossingProvider';
import { TomorrowIoProvider } from './TomorrowIoProvider';
import { OpenMeteoProvider } from './OpenMeteoProvider';
import { PirateWeatherProvider } from './PirateWeatherProvider';

export const ProviderFactories: ProviderFactory[] = [
  ExampleProvider,
  WeatherFlowProvider,
  VisualCrossingProvider,
  TomorrowIoProvider,
  OpenMeteoProvider,
  PirateWeatherProvider,
];
