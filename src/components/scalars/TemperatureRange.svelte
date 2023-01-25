<script lang="ts">
  import Temperature from './Temperature.svelte';

  export let low: number;
  export let high: number;
  export let global_low: number;
  export let global_high: number;

  let margin_left: number;
  let margin_right: number;

  $: {
    margin_left = (100 * (low - global_low)) / (global_high - global_low);
    margin_right = (100 * (global_high - high)) / (global_high - global_low);
  }
</script>

<div class="flex w-10/12 sm:w-11/12">
  <div class="text-right min-w-fit" style="min-width: {margin_left === 0 ? 'min-content' : `${margin_left}%`};">
    <Temperature value={low} />
  </div>
  <div class="bg-gray-800 dark:bg-gray-400 my-0.5 mx-1.5 rounded-xl" style="width: {100 - margin_right - margin_left}%;" />
  <div style="max-width: {margin_right}%;">
    <Temperature value={high} />
  </div>
</div>
