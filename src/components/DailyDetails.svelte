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

<div class="grid grid-flow-col place-items-center md:auto-cols-fr gap-4 md:gap-8 mb-6">
  <div>
    <Icon icon="mingcute:sunrise-line" class="inline text-2xl sm:text-3xl align-bottom" />
    <span class="text-sm md:text-base"><Timestamp format="short" value={daily.sunrise_timestamp} /></span>
    <Icon icon="mingcute:sunset-fill" class="inline text-2xl sm:text-3xl align-bottom" />
    <span class="text-sm md:text-base"><Timestamp format="short" value={daily.sunset_timestamp} /></span>
  </div>
  {#if daily.precipitation_probability !== undefined}
    <div>
      <span class="text-sm md:text-base font-semibold">Precipitation:</span> <span class="text-sm md:text-base">{daily.precipitation_probability}%</span>
    </div>
  {/if}
  {#if daily.precipitation_amount !== undefined}
    <div>
      <span class="text-sm md:text-base font-semibold">Precipitation:</span>
      <span class="text-sm md:text-base"><Amount value={daily.precipitation_amount} /></span>
    </div>
  {/if}
</div>
