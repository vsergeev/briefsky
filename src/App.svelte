<script lang="ts">
  import { onMount } from 'svelte';

  import {
    Alert,
    CloseButton,
    Navbar,
    Button,
    FooterIcon,
    DarkMode,
    Accordion,
    AccordionItem,
    Popover,
    Progressbar,
    Skeleton,
    ListPlaceholder,
  } from 'flowbite-svelte';
  import Icon from '@iconify/svelte';

  import type { ProviderFactory, Provider, Weather } from './providers/Provider';
  import { Location } from './providers/Location';
  import { ExampleProvider } from './providers/ExampleProvider';
  import { AutoExpand, configuration } from './Configuration';

  import Timestamp from './components/scalars/Timestamp.svelte';
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
  let weather: Weather | undefined;
  let error: string | undefined;
  let nextRefreshTimestamp: Date;
  let settingsModal: SettingsModal;
  let aboutModal: AboutModal;

  /* Provider Factory getter */
  const providerFactory = (provider: Provider) => provider.constructor as unknown as ProviderFactory;

  async function refresh() {
    /* Fetch weather */
    try {
      weather = await provider.fetch();
      error = undefined;
    } catch (err) {
      weather = undefined;
      error = err.message;
    }

    /* Compute next refresh timestamp */
    nextRefreshTimestamp = new Date(Date.now() + $configuration.refreshInterval * 1000);

    /* Setup timer for next refresh */
    setTimeout(refresh, $configuration.refreshInterval * 1000);
  }

  onMount(async () => {
    /* Log version and configuration */
    console.log('briefsky version', `v${window.__APP_VERSION__}-${window.__APP_COMMIT_ID__}`);
    console.log('Configuration', $configuration);

    /* Update page title */
    if ($configuration.title) {
      document.title = `briefsky - ${$configuration.title}`;
    }

    /* Get location if required */
    const location = ($configuration.providerFactory.requiresLocation && ($configuration.location || (await Location.fromGeolocation()))) || undefined;

    /* Instantiate provider */
    provider = $configuration.providerFactory.fromParams($configuration.providerParams, location) || new ExampleProvider();

    /* Fetch weather */
    await refresh();
  });
</script>

<main class="text-gray-800 dark:text-gray-200 text-sm md:text-base">
  <Navbar navClass="text-gray-700 dark:text-gray-300 px-4 py-2.5 w-full" navDivClass="mx-auto grid grid-cols-2 md:grid-cols-6 items-center" color="none">
    {#if provider && providerFactory(provider) === ExampleProvider}
      <Alert class="bg-gray-100 dark:bg-gray-700 mb-2 col-span-2 md:col-span-6" color="dark" border dismissable>
        <span slot="icon"><Icon icon="radix-icons:exclamation-triangle" class="text-lg" /></span>
        <span class="font-semibold">Example Weather Provider</span> — Please configure a weather provider in the settings.
        <CloseButton class="!ml-auto -mx-1.5 -my-1.5 hover:text-black dark:hover:text-white" slot="close-button" let:close on:click={close} />
      </Alert>
    {/if}
    <div>
      <span class="whitespace-nowrap leading-none text-xl font-semibold"><a href={window.location.href}>briefsky</a></span>
    </div>
    <div class="hidden md:block col-span-4 text-center">
      <span class="font-light">
        {#if $configuration.title}
          {$configuration.title} - <Timestamp format="long" value={weather ? weather.current.timestamp : new Date()} />
        {:else}
          <Timestamp format="long" value={weather ? weather.current.timestamp : new Date()} />
        {/if}
      </span>
    </div>
    <div class="flex justify-end">
      <div class="hidden sm:block">
        <Button id="btn-refresh" on:click={refresh} color="none" class={navbarButtonClass}><Icon icon="radix-icons:reload" class="text-xl" /></Button>
      </div>
      <Button on:click={() => settingsModal.open()} color="none" class={navbarButtonClass}><Icon icon="radix-icons:gear" class="text-xl" /></Button>
      <Button on:click={() => aboutModal.open()} color="none" class={navbarButtonClass}
        ><Icon icon="radix-icons:question-mark-circled" class="text-xl" /></Button
      >
      <DarkMode class={navbarButtonClass} />
    </div>
  </Navbar>

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
      {#if provider && providerFactory(provider).attribution !== undefined}
        <div class="mb-3 text-sm">
          Weather data by <a href={providerFactory(provider).attribution} target="_blank" rel="noreferrer" class="hover:underline"
            >{providerFactory(provider).description}</a
          >
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
