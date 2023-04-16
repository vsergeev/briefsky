<script lang="ts">
  import type { DailyWeather, SunTimes } from '../providers/Provider';

  import Conditions from './scalars/Conditions.svelte';
  import DailyPrecipitationDetails from './DailyPrecipitationDetails.svelte';
  import DailySunDetails from './DailySunDetails.svelte';

  export let daily: DailyWeather;
  export let suntimes: SunTimes;
</script>

<div class="grid place-items-center mb-4">
  <div><span class="text-lg sm:text-xl"><Conditions value={daily.conditions} /></span></div>
</div>

<div class="grid grid-cols-2 md:grid-cols-none md:grid-flow-col md:place-items-center md:justify-center gap-2 md:gap-8 ">
  <DailyPrecipitationDetails precipitation={{ precipitation_probability: daily.precipitation_probability, precipitation_amount: daily.precipitation_amount }}/>
</div>

<div class="grid grid-cols-2 md:grid-cols-none md:grid-flow-col md:place-items-center md:justify-center gap-2 md:gap-8 md:mx-0 mt-3 mb-6">
  <DailySunDetails {suntimes} />
</div>
