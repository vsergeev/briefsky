<script lang="ts">
  import { ConditionsIcon } from '../../providers/Provider';
  import Icon from '@iconify/svelte';

  export let value: ConditionsIcon;
  export let size: string = 'small';

  const ICON_MAP: { [key: number]: string } = {
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

  /* Adjustments to make weather icons vertically aligned with each other */
  const ICON_ADJUSTMENT_MAP: { [key: string]: string } = {
    'wi:day-cloudy': size === 'small' ? 'top-0.5' : 'top-2',
    'wi:fog': size === 'small' ? '-top-0.5' : '-top-2',
    'wi:showers': size === 'small' ? '-top-0.5' : '-top-2',
    'wi:rain': size === 'small' ? '-top-0.5' : '-top-2',
    'wi:sleet': size === 'small' ? '-top-0.5' : '-top-2',
    'wi:snow': size === 'small' ? '-top-0.5' : '-top-2',
    'wi:thunderstorm': size === 'small' ? '-top-0.5' : '-top-2',
  };

  const icon = ICON_MAP[value] ?? ICON_MAP[ConditionsIcon.Unknown];
</script>

<Icon
  {icon}
  class={`relative ${ICON_ADJUSTMENT_MAP[icon] ?? ''} ` + (size === 'small' ? 'text-[30px] sm:text-[36px] -my-1.5' : 'text-[96px] sm:text-[112px] -my-6')}
/>
