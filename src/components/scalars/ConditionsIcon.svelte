<script lang="ts">
  import { ConditionsIcon } from '../../providers/Provider';
  import Icon from '@iconify/svelte';

  export let value: ConditionsIcon;
  export let size: string = 'small';

  const ICON_MAP = {
    [ConditionsIcon.Clear]: 'wi:day-sunny',
    [ConditionsIcon.PartlyCloudy]: 'wi:day-cloudy',
    [ConditionsIcon.MostlyCloudy]: 'wi:cloudy',
    [ConditionsIcon.Overcast]: 'wi:cloudy',
    [ConditionsIcon.Fog]: 'wi:fog',
    [ConditionsIcon.LightRain]: 'wi:showers',
    [ConditionsIcon.Rain]: 'wi:rain',
    [ConditionsIcon.LightSleet]: 'wi:sleet',
    [ConditionsIcon.Sleet]: 'wi:sleet',
    [ConditionsIcon.LightSnow]: 'wi:snow',
    [ConditionsIcon.Snow]: 'wi:snow',
    [ConditionsIcon.Thunderstorm]: 'wi:thunderstorm',
    [ConditionsIcon.Unknown]: 'wi:na',
  };
</script>

<Icon
  icon={ICON_MAP[value] ?? ICON_MAP[ConditionsIcon.Unknown]}
  class={size === 'small' ? 'text-[30px] sm:text-[36px] -mt-1.5 -mb-1.5' : 'text-[96px] sm:text-[112px] -mt-6 -mb-6'}
/>
