<script lang="ts">
  import { ConditionsIcon } from '../providers/Provider';
  import type { HourlyWeather } from '../providers/Provider';

  import Temperature from './primitives/Temperature.svelte';
  import Timestamp from './primitives/Timestamp.svelte';

  /* Properties */

  export let hourly: HourlyWeather[] = [];

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

  const MIN_TEMPERATURE_OPACITY = 0.25;

  /* State */

  let aggregation: {
    conditions: HourlyConditions;
    duration: number;
  }[] = [];
  let temperatureLow: number;
  let temperatureHigh: number;

  function temperatureOpacity(value: number): string {
    let percent = (value - temperatureLow) / (temperatureHigh - temperatureLow);
    const opacity = percent * (1 - MIN_TEMPERATURE_OPACITY) + MIN_TEMPERATURE_OPACITY;
    return opacity.toFixed(2);
  }

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

<div class="-mb-2">
  <div class="flex mb-1.5 overflow-hidden rounded-md text-sm sm:text-base">
    {#each aggregation as entry}
      <div class="h-10 leading-9 {CLASS_TEXT_MAP[entry.conditions][0]} text-center" style="width: {(100 * entry.duration) / 24}%;">
        {#if entry.duration > 4}
          <div class="truncate">{CLASS_TEXT_MAP[entry.conditions][1]}</div>
        {:else if entry.duration > 2}
          <div class="hidden md:block truncate">{CLASS_TEXT_MAP[entry.conditions][1]}</div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="flex w-full mb-1">
    {#each Array(25) as _, i}
      <div class="{i % 2 === 0 ? 'h-[8px]' : 'h-[5px]'} border-l border-gray-400" style="width: {i < 24 ? 100 / 24 : 0}%;" />
    {/each}
  </div>
  <div class="flex w-full text-xs sm:text-sm">
    <div style="width: {100 / 24}%;">
      <div class="hidden md:block">
        <Timestamp value={hourly[0].timestamp} format="hour" />
      </div>
    </div>
    {#each Array(11) as _, i}
      {@const timestamp = hourly[2 * (i + 1)].timestamp}
      <div class="text-center" style="width: {100 / 12}%;">
        <div class="{i === 0 || i === 2 || i === 4 || i === 6 || i === 8 || i === 10 ? 'block' : 'hidden'} md:block">
          <Timestamp value={timestamp} format="hour" />
        </div>
      </div>
    {/each}
    <div style="width: {100 / 24}%;" />
  </div>
  <div class="flex w-full text-base sm:text-lg font-light text-black dark:text-white">
    <div style="width: {100 / 24}%; opacity: {temperatureOpacity(hourly[0].temperature)};">
      <div class="hidden md:block">
        <Temperature value={hourly[0].temperature} />
      </div>
    </div>
    {#each Array(11) as _, i}
      {@const temperature = hourly[2 * (i + 1)].temperature}
      <div class="text-center" style="width: {100 / 12}%; opacity: {temperatureOpacity(temperature)};">
        <div class="{i === 0 || i === 2 || i === 4 || i === 6 || i === 8 || i === 10 ? 'block' : 'hidden'} md:block">
          &nbsp;<Temperature value={temperature} />
        </div>
      </div>
    {/each}
    <div style="width: {100 / 24}%;" />
  </div>
</div>
