<script lang="ts">
  import { configuration, Units } from '../../Configuration';

  export let value: number = 0;
  export let pill: boolean = false;

  function cToF(temperature: number): number {
    return (temperature * 9) / 5 + 32;
  }

  $: pillStyle = pill ? 'border border-slate-300 rounded-full px-2 py-0.5 font-medium' : '';
</script>

{#if $configuration.units === Units.Imperial}
  <span class={pillStyle}>{cToF(value).toFixed(0)}°</span>
{:else}
  <span class={pillStyle}>{value.toFixed(1)}°</span>
{/if}
