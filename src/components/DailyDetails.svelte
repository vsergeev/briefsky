<script lang="ts">
  import type { DailyWeather } from '../providers/Provider';

  import Icon from '@iconify/svelte';

  import Conditions from './scalars/Conditions.svelte';
  import Timestamp from './scalars/Timestamp.svelte';
  import Amount from './scalars/Amount.svelte';

  export let daily: DailyWeather;
</script>

<div class="w-full text-center mb-3">
  <div><span class="text-lg sm:text-xl"><Conditions value={daily.conditions} /></span></div>
</div>

<div class="grid grid-flow-col md:auto-cols-fr place-items-center gap-4 mb-4 md:mb-6">
  <div>
    <Icon icon="mingcute:sunrise-line" class="inline text-xl md:text-3xl align-bottom" />
    <span class="text-sm md:text-base"><Timestamp format="short" value={daily.sunrise_timestamp} /></span>
    <Icon icon="mingcute:sunset-fill" class="inline text-xl md:text-3xl align-bottom" />
    <span class="text-sm md:text-base"><Timestamp format="short" value={daily.sunset_timestamp} /></span>
  </div>
  <div>
    {#if daily.precipitation_probability !== undefined || daily.precipitation_amount !== undefined}
      <Icon icon="wi:raindrop" class="inline text-xl md:text-3xl align-bottom scale-150 translate-y-0.5 md:translate-y-1 translate-x-1" />
      <span class="text-sm md:text-base">
        {#if daily.precipitation_probability !== undefined && daily.precipitation_amount !== undefined}
          {daily.precipitation_probability}%, <Amount value={daily.precipitation_amount} />
        {:else if daily.precipitation_probability !== undefined}
          {daily.precipitation_probability}%
        {:else}
          <Amount value={daily.precipitation_amount} />
        {/if}
      </span>
    {/if}
  </div>
</div>
