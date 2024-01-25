<script lang="ts">
  import type { HourlyWeather } from '../providers/Provider';
  import Temperature from './scalars/Temperature.svelte';
  import Timestamp from './scalars/Timestamp.svelte';
  /* Properties */
  export let aggregation: { conditions: number; duration: number }[] = [];
  export let today: boolean = false;
  export let hourly: HourlyWeather[] = [];
  export let temperatureLow: number;
  export let temperatureHigh: number;
  export let CLASS_TEXT_MAP: { [key: number]: [string, string] };
</script>

<div class="flex flex-row mx-auto">
  <div class="flex flex-col w-9 overflow-hidden rounded-md text-sm sm:text-base">
    {#each aggregation as entry}
      <div class={CLASS_TEXT_MAP[entry.conditions][0]} style="height: {(100 * entry.duration) / 24}%;"></div>
    {/each}
  </div>
  <div class="text-sm ml-2">
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
    <div style="height:{100 / 24}%">&nbsp;</div>
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
      <div style="height:{100 / 24}%">&nbsp;</div>
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
