<script context="module" lang="ts">
  const CARDINAL_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

  export function kphToMph(speed: number): number {
    return speed * 0.62137119;
  }

  export function degreesToCardinal(degrees: number): string {
    return CARDINAL_DIRECTIONS[Math.floor((degrees + 11.25) / 22.5) % 16];
  }
</script>

<script lang="ts">
  import { configuration, Units } from '../../Configuration';
  import Icon from '@iconify/svelte';

  export let speed: number = 0;
  export let direction: number = 0;
</script>

{#if $configuration.units === Units.Imperial}
  <span>{kphToMph(speed).toFixed(0)} mph {degreesToCardinal(direction)}</span><Icon
    icon="wi:wind-deg"
    class="inline text-xl sm:text-2xl align-bottom ml-0.5"
    style={`transform: rotate(${(direction - 180).toFixed(0)}deg)`}
  />
{:else}
  <span>{speed.toFixed(0)} km/h {degreesToCardinal(direction)}</span><Icon
    icon="wi:wind-deg"
    class="inline text-xl sm:text-2xl align-bottom ml-0.5"
    style={`transform: rotate(${(direction - 180).toFixed(0)}deg)`}
  />
{/if}
