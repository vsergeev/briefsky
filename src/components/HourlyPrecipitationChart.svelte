<script lang="ts">
  import type { HourlyWeather } from '../providers/Provider';
  import { configuration, Units } from '../Configuration';

  import { mmToIn } from './primitives/Amount.svelte';

  import HourlyLineChart from './primitives/HourlyLineChart.svelte';

  /* Properties */

  export let index: number;
  export let hourly: HourlyWeather[] = [];

  /* Constants */

  const DEFAULT_LIMITS = {
    [Units.Metric]: [2.5, 5, 10],
    [Units.Imperial]: [0.1, 0.25, 0.5],
  };

  /* Derived State */

  let units: string;
  let timestamps: Date[];
  let probabilities: number[];
  let amounts: number[];
  let limit: number;

  $: {
    units = $configuration.units === Units.Imperial ? 'in' : 'mm';
    timestamps = hourly.map((h) => h.timestamp);
    probabilities = hourly.map((h) => h.precipitation_probability!);
    amounts = hourly.map((h) => ($configuration.units === Units.Imperial ? mmToIn(h.precipitation_amount!) : h.precipitation_amount!));
    limit = ((max) => DEFAULT_LIMITS[$configuration.units].find((lim) => max < lim) ?? max)(Math.max(...amounts));
  }
</script>

<HourlyLineChart
  uid="chart-precipitation-{index}"
  title="Precipitation (%, {units})"
  {timestamps}
  datasets={[
    {
      values: probabilities,
      limit: 100,
      valueFormatter: (value) => `${value.toFixed(0)}%`,
      tooltipFormatter: (value) => `${value.toFixed(0)}%`,
      style: {
        tickClass: 'fill-blue-600 dark:fill-blue-300',
        fillClass: 'fill-blue-500 dark:fill-blue-400 opacity-30',
        strokeClass: 'stroke-blue-600 dark:stroke-blue-300 stroke-[4] md:stroke-2',
        tooltipClass: 'text-blue-600 dark:text-blue-300',
        type: 'line',
        points: false,
        fill: true,
      },
    },
    {
      values: amounts,
      limit: limit,
      valueFormatter: (value) => `${$configuration.units === Units.Imperial ? value.toFixed(2) : value.toFixed(1)}`,
      tooltipFormatter: (value) => `${$configuration.units === Units.Imperial ? value.toFixed(2) : value.toFixed(1)} ${units}`,
      style: {
        tickClass: 'fill-green-600 dark:fill-green-300',
        fillClass: 'fill-green-500 dark:fill-green-400 opacity-30',
        strokeClass: 'stroke-green-600 dark:stroke-green-300 stroke-[4] md:stroke-2',
        tooltipClass: 'text-green-600 dark:text-green-300',
        type: 'line',
        points: false,
        fill: true,
      },
    },
  ]}
/>
