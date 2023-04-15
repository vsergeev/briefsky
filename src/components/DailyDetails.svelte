<script lang="ts">
  import type { DailyWeather } from '../providers/Provider';

  import Icon from '@iconify/svelte';

  import Conditions from './scalars/Conditions.svelte';
  import Timestamp from './scalars/Timestamp.svelte';
  import Amount from './scalars/Amount.svelte';

  export let daily: DailyWeather;
</script>

<div class="grid place-items-center mb-4">
  <div><span class="text-lg sm:text-xl"><Conditions value={daily.conditions} /></span></div>
</div>

<div class="grid grid-cols-2 md:grid-cols-none md:grid-flow-col md:place-items-center md:justify-center gap-2 md:gap-8 ">
  {#if daily.precipitation_probability !== undefined && daily.precipitation_amount !== undefined}
    <div>
      <span class="text-sm md:text-base font-semibold">Precipitation:</span> <span class="text-sm md:text-base">{daily.precipitation_probability}%</span>
    </div>
    <div>
      <span class="text-sm md:text-base font-semibold">Amount:</span> <Amount value={daily.precipitation_amount} />
    </div>
  {:else if daily.precipitation_probability !== undefined}
    <div>
      <span class="text-sm md:text-base font-semibold">Precipitation:</span> <span class="text-sm md:text-base">{daily.precipitation_probability}%</span>
    </div>
  {:else if daily.precipitation_amount !== undefined}
    <div>
      <span class="text-sm md:text-base font-semibold">Precipitation:</span> <span class="text-sm md:text-base"><Amount value={daily.precipitation_amount} /></span>
    </div>
  {/if}
</div>

<div class="grid grid-cols-2 md:grid-cols-none md:grid-flow-col md:place-items-center md:justify-center gap-2 md:gap-8 md:mx-0 mt-3 mb-6">
  <div>
    <span class="inline-block" style="transform:translate(-2px,-2px)"><Icon icon="mingcute:sunrise-line" class="inline text-2xl sm:text-3xl align-bottom" /></span>
    <span class="font-semibold">Sunrise: </span><Timestamp format="short" value={daily.sunrise_timestamp} />
  </div>
  <div>
    <span class="inline-block" style="transform:translate(-2px,-2px)"><Icon icon="mingcute:sunset-fill" class="inline text-2xl sm:text-3xl align-bottom" /></span>
    <span class="font-semibold">Sunset: </span><Timestamp format="short" value={daily.sunset_timestamp} />
  </div>
</div>
