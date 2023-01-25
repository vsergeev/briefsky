<script lang="ts">
  import type { ProviderFactory } from './providers/Provider';
  import type { Configuration } from './Configuration';

  import { ProviderFactories } from './providers';
  import { Units, decodeConfiguration, encodeConfiguration } from './Configuration';

  import { Modal, Label, Select, Input, Hr, Button } from 'flowbite-svelte';

  /* State */
  let modalOpen = false;
  let currentConfiguration: Configuration;

  /* Form State */
  let providerFactory: ProviderFactory | undefined;
  let providerParams: object;
  let units: Units;
  let title: string;
  let refreshInterval: number;

  function updateProviderParams() {
    providerParams =
      providerFactory === currentConfiguration.providerFactory
        ? Object.fromEntries(providerFactory.fields.map((f) => [f.name, currentConfiguration.providerParams[f.name]]))
        : {};
  }

  export function open() {
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    currentConfiguration = decodeConfiguration(urlParams);

    providerFactory = ProviderFactories.includes(currentConfiguration.providerFactory) ? currentConfiguration.providerFactory : undefined;
    units = currentConfiguration.units;
    title = currentConfiguration.title;
    refreshInterval = currentConfiguration.refreshInterval;

    updateProviderParams();

    modalOpen = true;
  }

  function handleClose() {
    modalOpen = false;
  }

  function handleSave() {
    let configuration: Configuration = {
      providerFactory,
      providerParams,
      units,
      title,
      refreshInterval,
    };

    window.location.search = new URLSearchParams(encodeConfiguration(configuration) as Record<string, string>).toString();
  }
</script>

<Modal bind:open={modalOpen} title="Settings" autoclose class="w-full sm:w-2/3">
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

    {#if providerFactory}
      {#each providerFactory.fields as field}
        <div>
          <Label for="input-{field.name}" class="mb-2">{field.description}</Label>
          <Input id="input-{field.name}" bind:value={providerParams[field.name]} required />
        </div>
      {/each}
    {/if}

    <Hr class="mt-2" height="h-px" />

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
      <Label for="input-title" class="mb-2">Title</Label>
      <Input id="input-title" bind:value={title} required />
    </div>
  </div>

  <svelte:fragment slot="footer">
    <Button on:click={handleClose} color="alternative" class="ml-auto">Cancel</Button>
    <Button on:click={handleSave} disabled={providerFactory === undefined}>Save</Button>
  </svelte:fragment>
</Modal>
