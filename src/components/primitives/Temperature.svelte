<script lang="ts">
  import { configuration, Units } from '../../Configuration';

  export let value: number = 0;

  function cToF(temperature: number): number {
    return (temperature * 9) / 5 + 32;
  }
</script>

{#if $configuration.units === Units.Imperial}
  <span>{cToF(value).toFixed(0)}°</span>
{:else}
  <span>{value.toFixed(1)}°</span>
{/if}
