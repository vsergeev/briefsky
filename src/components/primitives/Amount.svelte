<script context="module" lang="ts">
  export function mmToIn(amount: number): number {
    return amount * 0.0393700787;
  }
</script>

<script lang="ts">
  import { configuration, Units } from '../../Configuration';

  export let value: number = 0;
</script>

{#if $configuration.units === Units.Imperial}
  <span>{mmToIn(value).toFixed(2)} in</span>
{:else}
  <span>{value.toFixed(0)} mm</span>
{/if}
