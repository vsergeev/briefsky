<script lang="ts">
  import { configuration, Units } from '../../Configuration';

  export let speed: number = 0;
  export let direction: number = 0;

  const CARDINAL_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

  function kphToMph(speed: number): number {
    return speed * 0.62137119;
  }

  function degreesToCardinal(degrees: number): string {
    return CARDINAL_DIRECTIONS[Math.floor((degrees + 11.25) / 22.5) % 16];
  }
</script>

{#if $configuration.units === Units.Imperial}
  <span>{kphToMph(speed).toFixed(0)} mph {degreesToCardinal(direction)}</span>
{:else}
  <span>{speed.toFixed(0)} km/h {degreesToCardinal(direction)}</span>
{/if}
