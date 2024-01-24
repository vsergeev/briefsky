<script lang="ts">
  import type { HourlyWeather } from '../providers/Provider';
  import Temperature from './scalars/Temperature.svelte';
  import Timestamp from './scalars/Timestamp.svelte';

  /* Properties */
  export let aggregation: { conditions: number; duration: number }[] = [];
  export let hourly: HourlyWeather[] = [];
  export let temperatureLow: number;
  export let temperatureHigh: number;
  export let CLASS_TEXT_MAP: { [key: number]: [string, string] };

  /* State */
  const MIN_TEMPERATURE_OPACITY = 0.35;

  function temperatureOpacity(value: number): string {
    let percent = (value - temperatureLow) / (temperatureHigh - temperatureLow);
    const opacity = percent * (1 - MIN_TEMPERATURE_OPACITY) + MIN_TEMPERATURE_OPACITY;
    return opacity.toFixed(2);
  }
</script>

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
      <div class="{i % 2 === 0 ? 'block' : 'hidden'} md:block">
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
      <div class="{i % 2 === 0 ? 'block' : 'hidden'} md:block">
        &nbsp;<Temperature value={temperature} />
      </div>
    </div>
  {/each}
  <div style="width: {100 / 24}%;" />
</div>
