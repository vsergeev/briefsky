import type { ProviderFactory } from './Provider';

/* Providers */
import { ExampleProvider } from './ExampleProvider';
import { WeatherFlowProvider } from './WeatherFlowProvider';

export const ProviderFactories: ProviderFactory[] = [ExampleProvider, WeatherFlowProvider];
