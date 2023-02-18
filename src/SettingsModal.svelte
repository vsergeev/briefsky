<script lang="ts">
  import type { ProviderFactory } from './providers/Provider';
  import type { Configuration } from './Configuration';

  import { ProviderFactories } from './providers';
  import { Location } from './providers/Location';
  import { Units, decodeConfiguration, encodeConfiguration } from './Configuration';

  import { Modal, Label, Select, Input, Hr, Button, ButtonGroup, Spinner } from 'flowbite-svelte';
  import Icon from '@iconify/svelte';

  /* State */
  let modalOpen = false;
  let currentConfiguration: Configuration;

  /* Settings State */
  let providerFactory: ProviderFactory | undefined;
  let providerParams: object = {};
  let location: Location;
  let units: Units;
  let title: string;
  let refreshInterval: number;
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
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    currentConfiguration = decodeConfiguration(urlParams);

    providerFactory = ProviderFactories.includes(currentConfiguration.providerFactory) ? currentConfiguration.providerFactory : undefined;
    location = currentConfiguration.location || new Location('', '');
    units = currentConfiguration.units;
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

  function handleClose() {
    modalOpen = false;
  }

  function handleSave() {
    let configuration: Configuration = {
      providerFactory,
      providerParams,
      location: providerFactory.requiresLocation && location.valid() ? location : undefined,
      units,
      title,
      refreshInterval,
    };

    window.location.search = new URLSearchParams(encodeConfiguration(configuration) as Record<string, string>).toString();
  }

  $: {
    valid = providerFactory !== null && Object.values(providerParams).every((e) => e !== '') && (!providerFactory.requiresLocation || location.valid());
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
        <Label for="group-location" class="mb-2">Location</Label>
        <ButtonGroup id="group-location" class="w-full">
          <Input id="input-latitude" bind:value={location.latitude} placeholder="Latitude (decimal)" />
          <Input id="input-longitude" bind:value={location.longitude} placeholder="Longitude (decimal)" />
          <Button id="btn-locate" on:click={handleLocate} disabled={locationLoading} size="sm" outline class="!p-3" color="light">
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

  <svelte:fragment slot="footer">
    <Button on:click={handleClose} color="alternative" class="ml-auto">Cancel</Button>
    <Button on:click={handleSave} disabled={!valid}>Save</Button>
  </svelte:fragment>
</Modal>
