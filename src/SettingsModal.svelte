<script lang="ts">
  import type { ProviderFactory } from './providers/Provider';
  import type { Configuration } from './Configuration';

  import { ProviderFactories } from './providers';
  import { Location } from './providers/Location';
  import { Units, AutoExpand, loadConfiguration, storeConfiguration } from './Configuration';

  import { Modal, Tabs, TabItem, Label, Select, Input, Hr, Button, ButtonGroup, Spinner, Radio, Checkbox } from 'flowbite-svelte';
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

  /* Loading State for location */
  let locationLoading: boolean = false;

  function updateProviderParams() {
    providerParams =
      providerFactory === currentConfiguration.providerFactory
        ? Object.fromEntries(providerFactory.fields.map((f) => [f.name, currentConfiguration.providerParams[f.name]]))
        : Object.fromEntries(providerFactory.fields.map((f) => [f.name, '']));
  }

  export function open() {
    currentConfiguration = loadConfiguration();

    providerFactory = currentConfiguration.providerFactory;
    locationMode = currentConfiguration.location ? LocationMode.Coordinates : LocationMode.Geolocation;
    location = currentConfiguration.location || new Location('', '');
    units = currentConfiguration.units;
    autoexpand = currentConfiguration.autoexpand;
    title = currentConfiguration.title;
    showHourlyPrecipitation = currentConfiguration.showHourlyPrecipitation;
    showHourlyWind = currentConfiguration.showHourlyWind;

    updateProviderParams();

    modalOpen = true;
  }

  async function handleLocate() {
    locationLoading = true;
    location = (await Location.fromGeolocation()) || location;
    locationLoading = false;
  }

  function handlePaste(event: ClipboardEvent) {
    if (locationMode !== LocationMode.Coordinates) return;

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

<Modal bind:open={modalOpen} title="Settings" class="w-full sm:w-2/3">
  <div>
    <Tabs activeClasses="p-4 text-primary-600 bg-gray-100 rounded-t-lg dark:bg-gray-700 dark:text-primary-300" contentClass="mt-6">
      <TabItem open title="General">
        <div class="space-y-4">
          <div>
            <Label for="select-provider" class="mb-2">Weather Provider</Label>
            <Select
              id="select-provider"
              items={ProviderFactories.map((provider) => ({ name: provider.description, value: provider }))}
              bind:value={providerFactory}
              on:change={updateProviderParams}
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

            <div on:paste={handlePaste}>
              <Label for="group-location" class="mb-2">Coordinates</Label>
              <ButtonGroup id="group-location" class="w-full">
                <Input
                  id="input-latitude"
                  bind:value={location.latitude}
                  disabled={locationMode === LocationMode.Geolocation}
                  placeholder="Latitude (decimal)"
                />
                <Input
                  id="input-longitude"
                  bind:value={location.longitude}
                  disabled={locationMode === LocationMode.Geolocation}
                  placeholder="Longitude (decimal)"
                />
                <Button
                  id="btn-locate"
                  on:click={handleLocate}
                  disabled={locationMode === LocationMode.Geolocation || locationLoading}
                  size="sm"
                  outline
                  class="!p-3"
                  color="light"
                >
                  {#if locationLoading}
                    <Spinner size="5" color="gray" />
                  {:else}
                    <Icon icon="radix-icons:crosshair-2" class="text-lg" />
                  {/if}
                </Button>
              </ButtonGroup>
            </div>
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
