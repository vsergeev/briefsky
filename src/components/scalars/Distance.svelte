<script lang="ts">
  import { configuration, Units } from '../../Configuration';

  export let value: number = 0;

  function kmToMi(distance: number): number {
    return distance * 0.62137119;
  }
</script>

{#if $configuration.units === Units.Imperial}
  <span>{kmToMi(value).toFixed(2)} mi</span>
{:else}
  <span>{value.toFixed(2)} km</span>
{/if}
