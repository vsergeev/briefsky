<script lang="ts">
  import { configuration, Units } from '../../Configuration';

  export let value: number = 0;

  function mbToInHg(pressure: number): number {
    return pressure / 33.863886666667;
  }
</script>

{#if $configuration.units === Units.Imperial}
  <span>{mbToInHg(value).toFixed(2)} inHg</span>
{:else}
  <span>{value.toFixed(2)} mb</span>
{/if}
