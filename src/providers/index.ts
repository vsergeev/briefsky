import type { ProviderFactory } from './Provider';

/* Providers */
import { OpenMeteoProvider } from './OpenMeteoProvider';
import { VisualCrossingProvider } from './VisualCrossingProvider';
import { TomorrowIoProvider } from './TomorrowIoProvider';
import { PirateWeatherProvider } from './PirateWeatherProvider';
import { WeatherFlowProvider } from './WeatherFlowProvider';
import { ExampleProvider } from './ExampleProvider';

export const ProviderFactories: ProviderFactory[] = [
  OpenMeteoProvider,
  VisualCrossingProvider,
  TomorrowIoProvider,
  PirateWeatherProvider,
  WeatherFlowProvider,
  ExampleProvider,
];
