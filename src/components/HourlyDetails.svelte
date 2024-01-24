<script lang="ts">
  import { ConditionsIcon } from '../providers/Provider';
  import type { HourlyWeather } from '../providers/Provider';
  import { configuration, Layout } from '../Configuration';

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

  const MIN_TEMPERATURE_OPACITY = 0.35;

  /* State */

  let aggregation: {
    conditions: HourlyConditions;
    duration: number;
  }[] = [];
  let temperatureLow: number;
  let temperatureHigh: number;
  let selectedPill = 'Temp';

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

{#if $configuration.layout === Layout.Horizontal}
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
{:else if $configuration.layout === Layout.Vertical}
  <div class="flex flex-row mx-auto">
    <div class="flex flex-col w-9 overflow-hidden rounded-md text-sm sm:text-base">
      {#each aggregation as entry}
        <div class={CLASS_TEXT_MAP[entry.conditions][0]} style="height: {(100 * entry.duration) / 24}%;"></div>
      {/each}
    </div>
    <div class="text-sm ml-2 grow">
      <div style="height:{100 / 24}%;transform:translateY(2px);" class="grow flex items-top">
        {#if today}
          <span class="font-bold w-9 mr-2 inline-block text-right">Now</span>
        {:else}
          <span class="font-bold w-9 mr-2 inline-block text-right">
            <Timestamp value={hourly[0].timestamp} format="hour" />
          </span>
        {/if}
        <span class="font-normal italic mr-2">{hourly[0].conditions}</span>
        <span class="min-w-fit inline-block border-solid border-b-[1px] border-slate-300 grow h-2/4"></span>
      </div>
      <div style="height:{100 / 24}%;transform:translateY(2px);">&nbsp;</div>
      {#each Array(11) as _, i}
        {@const timestamp = hourly[2 * (i + 1)].timestamp}
        {@const condition = hourly[2 * (i + 1)].conditions}
        {@const previousCondition = hourly[2 * i].conditions}
        {@const newCondition = previousCondition !== condition}
        {@const width = (100 * (hourly[2 * i + 1].temperature - temperatureLow)) / (temperatureHigh - temperatureLow)}
        <div style="height:{100 / 24}%;transform:translateY(2px);" class="font-bold grow flex items-top">
          <span class="w-9 mr-2 inline-block text-right"><Timestamp value={timestamp} format="hour" /></span>
          <span class="font-normal italic mr-2 {newCondition ? 'block' : 'hidden'}">{newCondition ? condition : ''}</span>
          <span class="min-w-fit inline-block border-solid border-b-[1px] border-slate-300 grow h-2/4" style="min-width: calc({width}% - 50px)"></span>
        </div>
        <div style="height:{100 / 24}%;background:transparent;">&nbsp;</div>
      {/each}
    </div>
    <div class="grow text-base sm:text-lg font-light text-black dark:text-white">
      {#each Array(12) as _, i}
        {@const temperature = hourly[2 * i].temperature}
        {@const width = (100 * (temperature - temperatureLow)) / (temperatureHigh - temperatureLow)}
        <div style="height:{100 / 24}%;transform:translateY(2px);" class="grow flex items-top">
          <span class="min-w-fit inline-block border-solid border-b-[1px] border-slate-300 h-2/4" style="min-width: calc({width}% - 50px);"></span>
          <span class="ml-2" style="transform:translateY(-1px);"><Temperature pill value={temperature} /></span>
        </div>
        <div style="height:{100 / 24}%;">&nbsp;</div>
      {/each}
    </div>
  </div>
  <!-- <div class="flex flex-row mx-auto justify-between mt-8 mb-8 space-x-2 sm:space-x-0">
    {#each ['Temp', 'Feels like', 'wind ', 'Percipitation', 'Pressure', 'UV Index'] as text}
      <span
        class="border border-slate-300 rounded-full px-2 py-0.5 font-medium text-center"
        on:click={() => (selectedPill = text)}
        on:keydown={() => (selectedPill = text)}
        role="button"
        tabindex="0">{text}</span
      >
    {/each}
  </div> -->
{/if}
