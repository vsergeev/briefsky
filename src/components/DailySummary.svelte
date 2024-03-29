<script lang="ts">
  import type { CurrentWeather, DailyWeather } from '../providers/Provider';

  import ConditionsIcon from './primitives/ConditionsIcon.svelte';
  import Timestamp from './primitives/Timestamp.svelte';
  import TemperatureRange from './primitives/TemperatureRange.svelte';

  export let current: CurrentWeather;
  export let daily: DailyWeather;
  export let global_low: number;
  export let global_high: number;
</script>

<div class="flex items-center gap-4 w-full">
  <div><ConditionsIcon value={daily.conditions_icon} /></div>
  <div class="w-[10%]">
    <span class="font-semibold">
      {#if current.timestamp > daily.hourly[0].timestamp || daily.hourly[0].timestamp.getTime() - current.timestamp.getTime() < 3600 * 1000}
        Today
      {:else}
        <Timestamp format="day" value={daily.timestamp} />
      {/if}
    </span>
  </div>
  <div class="ml-auto grow"><TemperatureRange low={daily.temperature_low} high={daily.temperature_high} {global_low} {global_high} /></div>
</div>
