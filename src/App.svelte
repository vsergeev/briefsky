<script lang="ts">
  import { onMount } from 'svelte';

  import { Alert, Navbar, Button, FooterIcon, DarkMode, Accordion, AccordionItem, Popover, Progressbar } from 'flowbite-svelte';
  import Icon from '@iconify/svelte';

  import type { ProviderFactory, Provider, Weather } from './providers/Provider';
  import { ExampleProvider } from './providers/ExampleProvider';
  import { configuration } from './Configuration';

  import Timestamp from './components/scalars/Timestamp.svelte';
  import CurrentDetails from './components/CurrentDetails.svelte';
  import DailySummary from './components/DailySummary.svelte';
  import DailyDetails from './components/DailyDetails.svelte';
  import HourlyDetails from './components/HourlyDetails.svelte';
  import SettingsModal from './SettingsModal.svelte';
  import AboutModal from './AboutModal.svelte';
  import ErrorModal from './ErrorModal.svelte';

  /* Constants */
  const navbarButtonClass = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm p-2.5';

  /* State */
  let provider: Provider;
  let weather: Weather | undefined;
  let nextRefreshTimestamp: Date;
  let settingsModal: SettingsModal;
  let aboutModal: AboutModal;
  let errorModal: ErrorModal;

  /* Provider Factory getter */
  const providerFactory = (provider: Provider) => provider.constructor as unknown as ProviderFactory;

  async function refresh() {
    /* Fetch weather */
    try {
      weather = await provider.fetch();
    } catch (err) {
      errorModal.open('Fetching Weather', err.message);
    }

    /* Compute next refresh timestamp */
    nextRefreshTimestamp = new Date(Date.now() + $configuration.refreshInterval * 1000);

    /* Setup timer for next refresh */
    setTimeout(refresh, $configuration.refreshInterval * 1000);
  }

  onMount(async () => {
    /* Log configuration */
    console.log('Configuration', $configuration);

    /* Update page title */
    if ($configuration.title) {
      document.title = `briefsky - ${$configuration.title}`;
    }

    /* Instantiate provider */
    provider = $configuration.providerFactory.fromParams($configuration.providerParams) || new ExampleProvider();

    /* Fetch weather */
    await refresh();
  });
</script>

<main class="text-gray-800 dark:text-gray-200 text-sm md:text-base">
  <Navbar navClass="text-gray-700 dark:text-gray-300 px-4 py-2.5 w-full" navDivClass="mx-auto grid grid-cols-2 md:grid-cols-6 items-center" color="none">
    {#if provider && providerFactory(provider) === ExampleProvider}
      <Alert class="mb-2 col-span-2 md:col-span-6" color="dark" border dismissable>
        <span slot="icon"><Icon icon="radix-icons:exclamation-triangle" class="text-lg" /></span>
        <span class="font-semibold">Example Weather Provider</span> — Please configure a weather provider in the settings.
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
        <Button id="btn-refresh" on:click={refresh} btnClass={navbarButtonClass}><Icon icon="radix-icons:reload" class="text-xl" /></Button>
      </div>
      <Button on:click={() => settingsModal.open()} btnClass={navbarButtonClass}><Icon icon="radix-icons:gear" class="text-xl" /></Button>
      <Button on:click={() => aboutModal.open()} btnClass={navbarButtonClass}><Icon icon="radix-icons:question-mark-circled" class="text-xl" /></Button>
      <DarkMode btnClass={navbarButtonClass} />
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
      <CurrentDetails current={weather.current} />
      <div class="mx-6 mb-6">
        <HourlyDetails hourly={weather.current.hourly} />
      </div>
      <Accordion
        multiple
        activeClasses="bg-gray-100 dark:bg-gray-700 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800"
        inactiveClasses="hover:bg-gray-100 hover:dark:bg-gray-700"
        defaultClass="mx-2 sm:mx-0"
      >
        {#each weather.daily as daily}
          <AccordionItem class="!p-2 md:!p-4">
            <span slot="header" class="w-full">
              <DailySummary
                current={weather.current}
                {daily}
                global_low={Math.min(...weather.daily.map((d) => d.temperature_low))}
                global_high={Math.max(...weather.daily.map((d) => d.temperature_high))}
              />
            </span>
            <DailyDetails {daily} />
            <HourlyDetails hourly={daily.hourly} />
          </AccordionItem>
        {/each}
      </Accordion>
    {/if}

    <div class="grid place-items-center my-4">
      <div>
        <FooterIcon href="https://github.com/vsergeev/briefsky" target="_blank" class="text-gray-400 hover:text-gray-900">
          <Icon icon="mdi:github" class="text-3xl" />
        </FooterIcon>
      </div>
    </div>
  </div>

  <SettingsModal bind:this={settingsModal} />
  <AboutModal bind:this={aboutModal} textColorClass="text-gray-700 dark:text-gray-300" />
  <ErrorModal bind:this={errorModal} textColorClass="text-red-700 dark:text-red-300" />
</main>
