<script lang="ts">
  import type { HourlyWeather } from '../providers/Provider';
  import { configuration, Units } from '../Configuration';

  import { kphToMph, degreesToCardinal } from './primitives/Wind.svelte';

  import HourlyLineChart from './primitives/HourlyLineChart.svelte';

  /* Properties */

  export let index: number;
  export let hourly: HourlyWeather[] = [];

  /* Constants */

  const DEFAULT_LIMITS = {
    [Units.Metric]: [15, 30],
    [Units.Imperial]: [10, 20],
  };

  /* Derived State */

  let units: string;
  let timestamps: Date[];
  let speeds: number[];
  let directions: number[];
  let limit: number;

  $: {
    units = $configuration.units === Units.Imperial ? 'mph' : 'km/h';
    timestamps = hourly.map((h) => h.timestamp);
    speeds = hourly.map((h) => ($configuration.units === Units.Imperial ? kphToMph(h.wind_speed!) : h.wind_speed!));
    directions = hourly.map((h) => h.wind_direction!);
    limit = ((max) => DEFAULT_LIMITS[$configuration.units].find((lim) => max < lim) ?? max)(Math.max(...speeds));
  }
</script>

<HourlyLineChart
  uid="chart-wind-{index}"
  title="Wind ({units})"
  {timestamps}
  datasets={[
    {
      values: speeds,
      limit: limit,
      valueFormatter: (value) => value.toFixed(0),
      tooltipFormatter: (value, index) => `${value.toFixed(0)} ${units} from ${degreesToCardinal(directions[index])}`,
      style: {
        tickClass: 'fill-gray-800 dark:fill-gray-200',
        fillClass: 'fill-gray-800 dark:fill-gray-200',
        strokeClass: 'stroke-gray-800 dark:stroke-gray-200 stroke-[4] md:stroke-1',
        tooltipClass: 'text-gray-800 dark:text-gray-200',
        type: 'line',
        points: true,
        fill: false,
      },
    },
  ]}
/>
