<script lang="ts">
  import type { HourlyWeather, ConditionsIcon } from '../providers/Provider';

  import Conditions from './scalars/Conditions.svelte';
  import Temperature from './scalars/Temperature.svelte';
  import Timestamp from './scalars/Timestamp.svelte';

  export let hourly: HourlyWeather[] = [];

  let aggregation: {
    icon: ConditionsIcon;
    duration: number;
  }[] = [];

  $: {
    for (const entry of hourly) {
      if (aggregation.length == 0 || aggregation[aggregation.length - 1].icon != entry.conditions_icon) {
        aggregation.push({ icon: entry.conditions_icon, duration: 1 });
      } else {
        aggregation[aggregation.length - 1].duration += 1;
      }
    }
  }
</script>

<div>
  {#if false}
    {#each hourly as entry}
      <div>
        <div><Timestamp format="hour" value={entry.timestamp} /></div>
        <div><Conditions value={entry.conditions} /></div>
        <div><Temperature value={entry.temperature} /></div>
      </div>
    {/each}
  {/if}
</div>
