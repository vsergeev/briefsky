<script lang="ts">
  import { onMount } from 'svelte';

  import { Alert, Button, FooterIcon, DarkMode, Accordion, AccordionItem, Popover, Progressbar, Skeleton, ListPlaceholder } from 'flowbite-svelte';
  import Icon from '@iconify/svelte';

  import type { ProviderFactory, Provider, Weather } from './providers/Provider';
  import type { Geocoder } from './geocoders/Geocoder';
  import { Location } from './providers/Location';
  import { ExampleProvider } from './providers/ExampleProvider';
  import { AutoExpand, configuration } from './Configuration';

  import Timestamp from './components/primitives/Timestamp.svelte';
  import CurrentDetails from './components/CurrentDetails.svelte';
  import DailySummary from './components/DailySummary.svelte';
  import DailyDetails from './components/DailyDetails.svelte';
  import HourlyDetails from './components/HourlyDetails.svelte';
  import HourlyWindChart from './components/HourlyWindChart.svelte';
  import HourlyPrecipitationChart from './components/HourlyPrecipitationChart.svelte';
  import SettingsModal from './SettingsModal.svelte';
  import AboutModal from './AboutModal.svelte';

  /* Constants */
  const navbarButtonClass = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm p-2.5 focus:ring-0';

  /* State */
  let provider: Provider;
  let geocoder: Geocoder;
  let weather: Weather | undefined;
  let locationName: string | undefined;
  let error: string | undefined;
  let nextRefreshTimestamp: Date;
  let settingsModal: SettingsModal;
  let aboutModal: AboutModal;
  let activeRefreshTimeout: number | undefined;

  /* Provider Factory getter */
  const getProviderFactory = (provider: Provider) => provider.constructor as unknown as ProviderFactory;

  async function refresh() {
    /* Convert refresh interval to ms */
    const refreshIntervalMs = $configuration.refreshInterval * 1000;

    /* Clear existing refresh timer, allows undefined */
    clearTimeout(activeRefreshTimeout);

    /* Fetch weather */
    try {
      weather = await provider.fetch();
      error = undefined;
    } catch (err) {
      weather = undefined;
      error = err.message;
    }

    /* Compute next refresh timestamp */
    nextRefreshTimestamp = new Date(Date.now() + refreshIntervalMs);

    /* Setup timer for next refresh and store the ID */
    activeRefreshTimeout = setTimeout(refresh, refreshIntervalMs);
  }

  onMount(async () => {
    /* Log version and configuration */
    console.log('briefsky version', `v${window.__APP_VERSION__}-${window.__APP_COMMIT_ID__}`);
    console.log('Configuration', $configuration);

    /* Get location if required */
    const location = ($configuration.providerFactory.requiresLocation && ($configuration.location || (await Location.fromGeolocation()))) || undefined;

    /* Instantiate provider */
    provider = $configuration.providerFactory.fromParams($configuration.providerParams, location) || new ExampleProvider();

    /* Instantiate geocoder */
    geocoder = new $configuration.geocoderFactory();

    /* Fetch weather */
    refresh();

    /* Reverse geocode location */
    if (location) {
      try {
        locationName = await geocoder.reverseGeocode(location);
      } catch (err) {
        console.error(err);
      }
    }

    /* Update page title */
    if ($configuration.title) {
      document.title = `briefsky - ${$configuration.title}`;
    } else if (locationName) {
      document.title = `briefsky - ${locationName}`;
    }
  });
</script>

<main class="text-gray-800 dark:text-gray-200 text-sm md:text-base">
  <nav class="text-gray-700 dark:text-gray-300 px-4 py-2.5 w-full">
    {#if provider && getProviderFactory(provider) === ExampleProvider}
      <Alert class="bg-gray-100 dark:bg-gray-700 mx-auto container mb-2" color="dark" border dismissable>
        <span slot="icon"><Icon icon="radix-icons:exclamation-triangle" class="text-lg" /></span>
        <span class="font-semibold">Example Weather Provider</span> — Please configure a weather provider in the settings.
      </Alert>
    {/if}
    <div class="mx-auto grid grid-cols-3 items-center container">
      <div>
        <a class="leading-none text-xl font-semibold" href={window.location.href}>briefsky</a>
      </div>
      <div class="hidden md:block text-center">
        <span class="font-light">
          <Timestamp format="long" value={weather ? weather.current.timestamp : new Date()} />
        </span>
      </div>
      <div class="block md:hidden text-center">
        <span class="font-light"><Timestamp format="short" value={weather ? weather.current.timestamp : new Date()} /></span>
      </div>
      <div class="flex justify-end">
        <div class="hidden sm:block">
          <Button id="btn-refresh" on:click={refresh} color="none" class={navbarButtonClass}><Icon icon="radix-icons:reload" class="text-xl" /></Button>
        </div>
        <Button on:click={() => settingsModal.open()} color="none" class={navbarButtonClass}><Icon icon="radix-icons:gear" class="text-xl" /></Button>
        <div class="hidden sm:block">
          <Button on:click={() => aboutModal.open()} color="none" class={navbarButtonClass}
            ><Icon icon="radix-icons:question-mark-circled" class="text-xl" /></Button
          >
        </div>
        <DarkMode class={navbarButtonClass} />
      </div>
    </div>
  </nav>

  {#if weather}
    <Popover triggeredBy="#btn-refresh" class="text-sm" placement="bottom-start">
      <div class="space-y-2">
        <p>Next refresh in {((nextRefreshTimestamp.getTime() - Date.now()) / 60000).toFixed(0)} minutes.</p>
        <Progressbar progress={(100 * (1 - (nextRefreshTimestamp.getTime() - Date.now()) / (1000 * $configuration.refreshInterval))).toFixed(0)} />
      </div>
    </Popover>
  {/if}

  <div class="container mx-auto">
    {#if weather}
      {#if locationName || $configuration.title}
        <div class="w-full text-center">
          <span class="font-semibold text-base">{locationName || $configuration.title}</span>
        </div>
      {/if}
      <div class="mb-4 md:mb-6">
        <CurrentDetails current={weather.current} />
      </div>
      <div class="mx-6 mb-6">
        <HourlyDetails hourly={weather.current.hourly} />
      </div>
      <Accordion
        multiple
        classActive="text-inherit dark:text-inherit bg-gray-100 dark:bg-gray-700 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800"
        classInactive="text-inherit dark:text-inherit hover:bg-gray-100 hover:dark:bg-gray-700"
        class="text-inherit dark:text-inherit mx-2 sm:mx-0"
      >
        {#each weather.daily as daily, i}
          {@const nextHourly = weather.daily[i + 1]
            ? weather.daily[i + 1].hourly.find((h) => h.timestamp > daily.hourly[daily.hourly.length - 1].timestamp)
            : undefined}
          <AccordionItem
            class="!px-2 !py-3 md:!p-4"
            paddingDefault="py-4 px-4 md:px-14"
            open={$configuration.autoexpand === AutoExpand.All || (i === 0 && $configuration.autoexpand === AutoExpand.Today)}
          >
            <DailySummary
              slot="header"
              current={weather.current}
              {daily}
              global_low={Math.min(...weather.daily.map((d) => d.temperature_low))}
              global_high={Math.max(...weather.daily.map((d) => d.temperature_high))}
            />
            <div class="grid gap-y-4 mb-2">
              <DailyDetails {daily} />
              <HourlyDetails hourly={daily.hourly} />
              {#if daily.hourly[0].precipitation_probability !== undefined && $configuration.showHourlyPrecipitation}
                <HourlyPrecipitationChart index={i} hourly={nextHourly ? [...daily.hourly, nextHourly] : daily.hourly} />
              {/if}
              {#if daily.hourly[0].wind_speed !== undefined && $configuration.showHourlyWind}
                <HourlyWindChart index={i} hourly={nextHourly ? [...daily.hourly, nextHourly] : daily.hourly} />
              {/if}
            </div>
          </AccordionItem>
        {/each}
      </Accordion>
    {:else if error}
      <Alert class="text-lg w-3/4 my-6 mx-auto" color="red">
        <span slot="icon"><Icon icon="mdi:error-outline" class="text-2xl" /></span>
        <span class="font-semibold">Error fetching weather: </span>{error}
      </Alert>
    {:else}
      <div class="my-6">
        <Skeleton class="mx-auto !max-w-full !w-3/4" />
      </div>
      <div class="my-6">
        <ListPlaceholder class="mx-auto !max-w-full !w-full" />
      </div>
    {/if}

    <div class="grid place-items-center mt-3">
      {#if provider && getProviderFactory(provider).attribution}
        <div class="mb-3 text-center text-sm">
          <div>
            Weather data by <a href={getProviderFactory(provider).attribution} target="_blank" rel="noreferrer" class="hover:underline"
              >{getProviderFactory(provider).description}</a
            >
          </div>
          {#if locationName && $configuration.geocoderFactory.attribution}
            <div>
              Location data by <a href={$configuration.geocoderFactory.attribution} target="_blank" rel="noreferrer" class="hover:underline"
                >{$configuration.geocoderFactory.description}</a
              >
            </div>
          {/if}
        </div>
      {/if}
      <div class="mb-3">
        <FooterIcon href="https://github.com/vsergeev/briefsky" target="_blank" class="text-gray-500 hover:text-gray-900">
          <Icon icon="mdi:github" class="text-3xl" />
        </FooterIcon>
      </div>
    </div>
  </div>

  <SettingsModal bind:this={settingsModal} />
  <AboutModal bind:this={aboutModal} textColorClass="text-gray-700 dark:text-gray-300" />
</main>
