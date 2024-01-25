<script lang="ts">
  import type { CurrentWeather, SunTimes, DailyPrecipitation } from '../providers/Provider';

  import Conditions from './scalars/Conditions.svelte';
  import ConditionsIcon from './scalars/ConditionsIcon.svelte';
  import Temperature from './scalars/Temperature.svelte';
  import Wind from './scalars/Wind.svelte';
  import RelativeHumidity from './scalars/RelativeHumidity.svelte';
  import UVIndex from './scalars/UVIndex.svelte';
  import Distance from './scalars/Distance.svelte';
  import Pressure from './scalars/Pressure.svelte';
  import DailySunDetails from './DailySunDetails.svelte';

  export let current: CurrentWeather;
  export let suntimes: SunTimes;
</script>

<div>
  <div class="grid grid-rows-2 grid-flow-col justify-center items-center mt-2 mb-4">
    <div class="row-span-2 mr-2"><ConditionsIcon size="large" value={current.conditions_icon} /></div>
    <div><span class="text-2xl sm:text-4xl font-semibold"><Temperature value={current.temperature} /> <Conditions value={current.conditions} /></span></div>
    <div class="flex gap-2">
      <div><span class="font-semibold">Feels Like: </span><Temperature value={current.feels_like_temperature} /></div>
      <div><span class="font-semibold">Low: </span><Temperature value={current.temperature_low} /></div>
      <div><span class="font-semibold">High: </span><Temperature value={current.temperature_high} /></div>
    </div>
  </div>
  <div
    class="grid grid-cols-2 place-items-stretch md:grid-cols-3 lg:grid-cols-none lg:grid-flow-col lg:justify-center w-4/5 lg:w-full gap-2 lg:gap-8 mx-auto lg:mx-0"
  >
    <div><span class="font-semibold">Wind: </span><Wind speed={current.wind_speed} direction={current.wind_direction} /></div>
    <div><span class="font-semibold">Humidity: </span><RelativeHumidity value={current.relative_humidity} /></div>
    <div><span class="font-semibold">Dew Point: </span><Temperature value={current.dew_point_temperature} /></div>
    {#if current.uv_index !== undefined}
      <div><span class="font-semibold">UV Index: </span><UVIndex value={current.uv_index} /></div>
    {/if}
    {#if current.visibility !== undefined}
      <div><span class="font-semibold">Visibility: </span><Distance value={current.visibility} /></div>
    {/if}
    <div><span class="font-semibold">Pressure: </span><Pressure value={current.pressure} /></div>
    <DailySunDetails {suntimes} />
    <!-- <DailyPrecipitationDetails {precipitation} /> -->
  </div>
</div>
