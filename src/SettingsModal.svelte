<script lang="ts">
  import type { ProviderFactory } from './providers/Provider';
  import type { Configuration } from './Configuration';

  import { ProviderFactories } from './providers';
  import { Location } from './providers/Location';
  import { Units, decodeConfiguration, encodeConfiguration } from './Configuration';

  import { Modal, Label, Select, Input, Hr, Button, ButtonGroup, Spinner, Radio } from 'flowbite-svelte';
  import Icon from '@iconify/svelte';

  enum LocationMode {
    Geolocation,
    Coordinates,
  }

  /* State */
  let modalOpen = false;
  let currentConfiguration: Configuration;

  /* Settings State */
  let providerFactory: ProviderFactory | undefined;
  let providerParams: object = {};
  let locationMode: LocationMode;
  let location: Location;
  let units: Units;
  let title: string;
  let refreshInterval: number;
  let valid: boolean;
  let layout: string;

  /* Loading State for location */
  let locationLoading: boolean = false;

  function updateProviderParams() {
    providerParams =
      providerFactory === currentConfiguration.providerFactory
        ? Object.fromEntries(providerFactory.fields.map((f) => [f.name, currentConfiguration.providerParams[f.name]]))
        : Object.fromEntries(providerFactory.fields.map((f) => [f.name, '']));
  }

  export function open() {
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    currentConfiguration = decodeConfiguration(urlParams);

    providerFactory = ProviderFactories.includes(currentConfiguration.providerFactory) ? currentConfiguration.providerFactory : undefined;
    locationMode = currentConfiguration.location ? LocationMode.Coordinates : LocationMode.Geolocation;
    location = currentConfiguration.location || new Location('', '');
    units = currentConfiguration.units;
    layout = currentConfiguration.layout;
    title = currentConfiguration.title;
    refreshInterval = currentConfiguration.refreshInterval;

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

    const decodedLocation = Location.fromString(event.clipboardData.getData('text'));
    if (decodedLocation.valid()) {
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
      layout,
      title,
      refreshInterval,
    };

    window.location.search = new URLSearchParams(encodeConfiguration(configuration) as Record<string, string>).toString();
  }

  $: {
    valid =
      providerFactory &&
      Object.values(providerParams).every((e) => e !== '') &&
      (!providerFactory.requiresLocation || locationMode === LocationMode.Geolocation || location.valid());
  }
</script>

<Modal bind:open={modalOpen} title="Settings" class="w-full sm:w-2/3">
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

    {#if providerFactory && providerFactory.fields.length > 0}
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
          <Input id="input-latitude" bind:value={location.latitude} disabled={locationMode === LocationMode.Geolocation} placeholder="Latitude (decimal)" />
          <Input id="input-longitude" bind:value={location.longitude} disabled={locationMode === LocationMode.Geolocation} placeholder="Longitude (decimal)" />
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
      <Label for="select-layout" class="mb-2">Layout</Label>
      <Select
        id="select-layout"
        items={[
          { name: 'Horizontal', value: 'horizontal' },
          { name: 'Vertical', value: 'vertial' },
        ]}
        bind:value={layout}
      />
    </div>

    <div>
      <Label for="input-title" class="mb-2">Title (optional)</Label>
      <Input id="input-title" bind:value={title} required />
    </div>
  </div>

  <svelte:fragment slot="footer">
    <Button on:click={handleClose} color="alternative" class="ml-auto">Cancel</Button>
    <Button on:click={handleSave} disabled={!valid}>Save</Button>
  </svelte:fragment>
</Modal>
