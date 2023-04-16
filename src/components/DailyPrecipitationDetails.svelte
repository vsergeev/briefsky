<script lang="ts">
  import type { DailyPrecipitation } from '../providers/Provider';

  import Amount from './scalars/Amount.svelte';

  export let precipitation: DailyPrecipitation;
</script>

{#if precipitation.precipitation_probability !== undefined && precipitation.precipitation_amount !== undefined}
	<div>
		<span class="text-sm md:text-base font-semibold">Precipitation:</span> <span class="text-sm md:text-base">{precipitation.precipitation_probability}%</span>
	</div>
	<div>
		<span class="text-sm md:text-base font-semibold">Amount:</span> <Amount value={precipitation.precipitation_amount} />
	</div>
{:else if precipitation.precipitation_probability !== undefined}
	<div>
		<span class="text-sm md:text-base font-semibold">Precipitation:</span> <span class="text-sm md:text-base">{precipitation.precipitation_probability}%</span>
	</div>
{:else if precipitation.precipitation_amount !== undefined}
	<div>
		<span class="text-sm md:text-base font-semibold">Precipitation:</span> <span class="text-sm md:text-base"><Amount value={precipitation.precipitation_amount} /></span>
	</div>
{/if}
