<script lang="ts">
  import type { SunTimes } from '../providers/Provider';

  import Icon from '@iconify/svelte';

  import Timestamp from './scalars/Timestamp.svelte';

  export let suntimes: SunTimes;
</script>

<div>
  <span style="transform:translate(-2px,-2px)"><Icon icon="mingcute:sunrise-line" class="inline text-2xl sm:text-3xl align-bottom" /></span>
  <span class="font-semibold">Sunrise: </span><Timestamp format="short" value={suntimes.sunrise_timestamp} />
</div>
<div>
  <span style="transform:translate(-2px,-2px)"><Icon icon="mingcute:sunset-fill" class="inline text-2xl sm:text-3xl align-bottom" /></span>
  <span class="font-semibold">Sunset: </span><Timestamp format="short" value={suntimes.sunset_timestamp} />
</div>
