<script lang="ts">
  import type { ProviderFactory } from './providers/Provider';
  import type { Configuration } from './Configuration';

  import { ProviderFactories } from './providers';
  import { Location } from './providers/Location';
  import type { Geocoder, LocationCandidate } from './geocoders/Geocoder';
  import { Units, AutoExpand, loadConfiguration, storeConfiguration } from './Configuration';

  import { Modal, Tabs, TabItem, Label, Select, Input, Hr, Tooltip, Button, ButtonGroup, Spinner, Radio, Checkbox } from 'flowbite-svelte';
  import Icon from '@iconify/svelte';

  enum LocationMode {
    Geolocation,
    Coordinates,
  }

  /* State */
  let modalOpen = false;
  let currentConfiguration: Configuration;

  /* Settings State */
  let providerFactory: ProviderFactory;
  let providerParams: { [key: string]: string } = {};
  let locationMode: LocationMode;
  let location: Location;
  let units: Units;
  let autoexpand: AutoExpand;
  let title: string;
  let showHourlyPrecipitation: boolean;
  let showHourlyWind: boolean;
  let valid: boolean;

  /* Location Search State */
  let geocoder: Geocoder;
  let locationSearch: { query: string; loading: boolean; open: boolean; results: LocationCandidate[] } = {
    query: '',
    loading: false,
    open: false,
    results: [],
  };

  /* Geolocation Loading State */
  let locationGeolocationLoading: boolean = false;

  export function open() {
    currentConfiguration = loadConfiguration();

    providerFactory = currentConfiguration.providerFactory;
    geocoder = new currentConfiguration.geocoderFactory();
    locationMode = currentConfiguration.location ? LocationMode.Coordinates : LocationMode.Geolocation;
    locationSearch = { query: '', loading: false, open: false, results: [] };
    location = currentConfiguration.location || new Location('', '');
    units = currentConfiguration.units;
    autoexpand = currentConfiguration.autoexpand;
    title = currentConfiguration.title;
    showHourlyPrecipitation = currentConfiguration.showHourlyPrecipitation;
    showHourlyWind = currentConfiguration.showHourlyWind;

    handleProviderChange();

    modalOpen = true;
  }

  function handleProviderChange() {
    providerParams =
      providerFactory === currentConfiguration.providerFactory
        ? Object.fromEntries(providerFactory.fields.map((f) => [f.name, currentConfiguration.providerParams[f.name]]))
        : Object.fromEntries(providerFactory.fields.map((f) => [f.name, '']));
  }

  async function handleSearch() {
    if (locationSearch.query === '') return;

    locationSearch.loading = true;
    try {
      locationSearch.results = await geocoder.forwardGeocode(locationSearch.query);
    } catch (err) {
      locationSearch.results = [];
      console.error(err);
    }
    locationSearch.loading = false;
    locationSearch.open = true;
  }

  async function handleSearchResult(result: LocationCandidate) {
    locationSearch.query = result.name;
    locationSearch.open = false;
    location = result.location;
  }

  function handleClickOutside(event: MouseEvent) {
    if (locationSearch.open && !event.composedPath().includes(document.getElementById('dropdown-search')!)) {
      locationSearch.open = false;
    }
  }

  async function handleGeolocation() {
    locationGeolocationLoading = true;
    location = (await Location.fromGeolocation()) || location;
    locationGeolocationLoading = false;
  }

  function handlePaste(event: ClipboardEvent) {
    const decodedLocation = Location.fromString(event.clipboardData ? event.clipboardData.getData('text') : undefined);
    if (decodedLocation && decodedLocation.valid()) {
      location = decodedLocation;
      event.preventDefault();
    }
  }

  function handleClose() {
    modalOpen = false;
  }

  function handleSave() {
    let configuration: Configuration = {
      providerFactory,
      providerParams,
      geocoderFactory: currentConfiguration.geocoderFactory,
      location: (providerFactory.requiresLocation && locationMode === LocationMode.Coordinates && location.valid() && location) || undefined,
      units,
      autoexpand,
      title,
      refreshInterval: currentConfiguration.refreshInterval,
      showHourlyPrecipitation,
      showHourlyWind,
    };

    storeConfiguration(configuration);
  }

  $: {
    valid =
      providerFactory &&
      Object.values(providerParams).every((e) => e !== '') &&
      (!providerFactory.requiresLocation || locationMode === LocationMode.Geolocation || location.valid());
  }
</script>

<Modal bind:open={modalOpen} title="Settings" class="w-full sm:w-2/3" classHeader="text-gray-900 dark:text-white">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:mousedown={handleClickOutside}>
    <Tabs activeClasses="p-4 text-primary-600 bg-gray-100 rounded-t-lg dark:bg-gray-700 dark:text-primary-300" contentClass="mt-6">
      <TabItem open title="General">
        <div class="space-y-4">
          <div>
            <Label for="select-provider" class="mb-2">Weather Provider</Label>
            <Select
              id="select-provider"
              items={ProviderFactories.map((provider) => ({ name: provider.description, value: provider }))}
              bind:value={providerFactory}
              on:change={handleProviderChange}
              placeholder="Select Provider"
            />
          </div>

          {#if providerFactory.fields.length > 0}
            {#each providerFactory.fields as field}
              <div>
                <Label for="input-{field.name}" class="mb-2">{field.description}</Label>
                <Input id="input-{field.name}" bind:value={providerParams[field.name]} required />
              </div>
            {/each}
          {/if}

          <Hr class="mt-2" height="h-px" />

          {#if providerFactory.requiresLocation}
            <div>
              <Label for="radio-location-mode" class="mb-2">Location</Label>
              <div class="flex gap-4 ml-2 my-5">
                <Radio id="radio-location-mode" bind:group={locationMode} value={LocationMode.Geolocation}>Geolocation</Radio>
                <Radio bind:group={locationMode} value={LocationMode.Coordinates}>Coordinates</Radio>
              </div>
            </div>

            {#if locationMode === LocationMode.Coordinates}
              <div class="w-full">
                <Label for="group-search" class="mb-2">Coordinates</Label>

                <form on:submit|preventDefault={handleSearch}>
                  <ButtonGroup id="group-search" class="w-full mb-2">
                    <Input id="input-search" autocomplete="off" bind:value={locationSearch.query} placeholder="Search locations..." />
                    <Button id="btn-search" type="submit" disabled={locationSearch.loading} size="sm" outline class="!p-3" color="light">
                      {#if locationSearch.loading}
                        <Spinner size="5" color="gray" />
                      {:else}
                        <Icon icon="radix-icons:magnifying-glass" class="text-lg" />
                      {/if}
                    </Button>
                  </ButtonGroup>
                </form>

                {#if locationSearch.open}
                  <div id="dropdown-search" class="relative">
                    <div
                      class="absolute w-full py-2 max-h-48 overflow-y-auto overscroll-contain rounded-lg shadow-lg text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700"
                    >
                      {#if locationSearch.results.length === 0}
                        <div class="w-full px-4 text-left">No results found.</div>
                      {:else}
                        {#each locationSearch.results as result}
                          <button class="w-full px-4 py-2 text-left hover:bg-primary-600 hover:text-white" on:click={() => handleSearchResult(result)}
                            >{result.name}</button
                          >
                        {/each}
                      {/if}
                    </div>
                  </div>
                {/if}

                <div on:paste={handlePaste}>
                  <ButtonGroup id="group-location" class="w-full">
                    <Input id="input-latitude" bind:value={location.latitude} placeholder="Latitude (decimal)" />
                    <Input id="input-longitude" bind:value={location.longitude} placeholder="Longitude (decimal)" />
                    <Tooltip type="auto" triggeredBy="#btn-geolocate">Geolocate</Tooltip>
                    <Button id="btn-geolocate" on:click={handleGeolocation} disabled={locationGeolocationLoading} size="sm" outline class="!p-3" color="light">
                      {#if locationGeolocationLoading}
                        <Spinner size="5" color="gray" />
                      {:else}
                        <Icon icon="radix-icons:crosshair-2" class="text-lg" />
                      {/if}
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            {/if}
          {/if}

          <div>
            <Label for="select-units" class="mb-2">Units</Label>
            <Select
              id="select-units"
              items={[
                { name: 'Imperial', value: Units.Imperial },
                { name: 'Metric', value: Units.Metric },
              ]}
              bind:value={units}
            />
          </div>

          <div>
            <Label for="input-title" class="mb-2">Title (optional)</Label>
            <Input id="input-title" bind:value={title} required />
          </div>
        </div>
      </TabItem>
      <TabItem title="View">
        <div class="space-y-4">
          <div>
            <Label for="select-autoexpand" class="mb-2">Auto-Expand</Label>
            <Select
              id="select-autoexpand"
              items={[
                { name: 'Today', value: AutoExpand.Today },
                { name: 'All', value: AutoExpand.All },
                { name: 'None', value: AutoExpand.None },
              ]}
              bind:value={autoexpand}
            />
          </div>
          <div>
            <Checkbox bind:checked={showHourlyPrecipitation}>Show Hourly Precipitation Chart</Checkbox>
          </div>
          <div>
            <Checkbox bind:checked={showHourlyWind}>Show Hourly Wind Chart</Checkbox>
          </div>
        </div>
      </TabItem>
    </Tabs>
  </div>

  <svelte:fragment slot="footer">
    <Button on:click={handleClose} color="alternative" class="ml-auto">Cancel</Button>
    <Button on:click={handleSave} disabled={!valid}>Save</Button>
  </svelte:fragment>
</Modal>
