import type { ProviderFactory } from './Provider';

/* Providers */
import { ExampleProvider } from './ExampleProvider';
import { WeatherFlowProvider } from './WeatherFlowProvider';
import { VisualCrossingProvider } from './VisualCrossingProvider';

export const ProviderFactories: ProviderFactory[] = [ExampleProvider, WeatherFlowProvider, VisualCrossingProvider];
