import type { ProviderFactory } from './Provider';

/* Providers */
import { ExampleProvider } from './ExampleProvider';
import { WeatherFlowProvider } from './WeatherFlowProvider';
import { VisualCrossingProvider } from './VisualCrossingProvider';
import { TomorrowIoProvider } from './TomorrowIoProvider';

export const ProviderFactories: ProviderFactory[] = [ExampleProvider, WeatherFlowProvider, VisualCrossingProvider, TomorrowIoProvider];
