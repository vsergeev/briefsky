<script lang="ts">
  import { ConditionsIcon } from '../providers/Provider';
  import type { HourlyWeather } from '../providers/Provider';
  import { configuration, Layout } from '../Configuration';

  import HourlyVerticalLayout from './HourlyVerticalLayout.svelte';
  import HourlyHorizontalLayout from './HourlyHorizontalLayout.svelte';
  import Temperature from './scalars/Temperature.svelte';
  import Timestamp from './scalars/Timestamp.svelte';

  /* Properties */

  export let hourly: HourlyWeather[] = [];
  export let today: boolean = false;

  /* Constants */

  enum HourlyConditions {
    Clear,
    PartlyCloudy,
    MostlyCloudy,
    Overcast,
    Fog,
    LightRain,
    Rain,
    LightSleet,
    Sleet,
    LightSnow,
    Snow,
    Unknown,
  }

  const CLASS_TEXT_MAP: { [key: number]: [string, string] } = {
    [HourlyConditions.Clear]: ['bg-[#eeeef5] dark:bg-gray-400 text-[#333] dark:text-[#111] [text-shadow:_1px_1px_0_rgb(255_255_255_/_0.6)]', 'Clear'],
    [HourlyConditions.PartlyCloudy]: [
      'bg-[#d5dae2] dark:bg-gray-500 text-[#333] dark:text-[#fff] [text-shadow:_1px_1px_0_rgb(255_255_255_/_0.6)] dark:[text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]',
      'Partly Cloudy',
    ],
    [HourlyConditions.MostlyCloudy]: [
      'bg-[#b6bfcb] dark:bg-gray-600 text-[#333] dark:text-[#fff] [text-shadow:_1px_1px_0_rgb(255_255_255_/_0.6)] dark:[text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]',
      'Mostly Cloudy',
    ],
    [HourlyConditions.Overcast]: ['bg-[#878f9a] dark:bg-gray-700 text-[#fff] [text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]', 'Overcast'],
    [HourlyConditions.Fog]: ['bg-[#878f9a] dark:bg-gray-700 text-[#fff] [text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]', 'Fog'],
    [HourlyConditions.LightRain]: ['bg-[#80a5d6] text-[#fff] [text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]', 'Light Rain'],
    [HourlyConditions.Rain]: ['bg-[#4a80c7] text-[#fff] [text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]', 'Rain'],
    [HourlyConditions.LightSleet]: ['bg-[#96a5d9] text-[#fff] [text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]', 'Light Sleet'],
    [HourlyConditions.Sleet]: ['bg-[#6b81cb] text-[#fff] [text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]', 'Sleet'],
    [HourlyConditions.LightSnow]: ['bg-[#aba4db] text-[#fff] [text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]', 'Light Snow'],
    [HourlyConditions.Snow]: ['bg-[#8c82ce] text-[#fff] [text-shadow:_1px_1px_0_rgb(0_0_0_/_0.6)]', 'Snow'],
    [HourlyConditions.Unknown]: ['bg-red-300 text-[#000] [text-shadow:_1px_1px_0_rgb(255_255_255_/_0.6)]', 'Unknown'],
  };

  const ICON_MAP: { [key: number]: HourlyConditions } = {
    [ConditionsIcon.Clear]: HourlyConditions.Clear,
    [ConditionsIcon.PartlyCloudy]: HourlyConditions.PartlyCloudy,
    [ConditionsIcon.MostlyCloudy]: HourlyConditions.MostlyCloudy,
    [ConditionsIcon.Overcast]: HourlyConditions.Overcast,
    [ConditionsIcon.Fog]: HourlyConditions.Fog,
    [ConditionsIcon.LightRain]: HourlyConditions.LightRain,
    [ConditionsIcon.Rain]: HourlyConditions.Rain,
    [ConditionsIcon.LightSleet]: HourlyConditions.LightSleet,
    [ConditionsIcon.Sleet]: HourlyConditions.Sleet,
    [ConditionsIcon.LightSnow]: HourlyConditions.LightSnow,
    [ConditionsIcon.Snow]: HourlyConditions.Snow,
    [ConditionsIcon.Thunderstorm]: HourlyConditions.Rain,
  };

  /* State */

  let aggregation: {
    conditions: HourlyConditions;
    duration: number;
  }[] = [];
  let temperatureLow: number;
  let temperatureHigh: number;
  let selectedPill = 'Temp';

  $: {
    /* Aggregate conditions into contiguous regions */
    aggregation = [];
    for (const entry of hourly) {
      const conditions = ICON_MAP[entry.conditions_icon] ?? HourlyConditions.Unknown;
      if (aggregation.length === 0 || aggregation[aggregation.length - 1].conditions !== conditions) {
        aggregation.push({ conditions: conditions, duration: 1 });
      } else {
        aggregation[aggregation.length - 1].duration += 1;
      }
    }

    /* Compute low and high temperatures */
    temperatureLow = Math.min(...hourly.map((h) => h.temperature));
    temperatureHigh = Math.max(...hourly.map((h) => h.temperature));
  }
</script>

{#if $configuration.layout === Layout.Horizontal}
  <HourlyHorizontalLayout {aggregation} {hourly} {temperatureLow} {temperatureHigh} {CLASS_TEXT_MAP} />
{:else if $configuration.layout === Layout.Vertical}
  <HourlyVerticalLayout {aggregation} {today} {hourly} {temperatureLow} {temperatureHigh} {CLASS_TEXT_MAP} />
{/if}
