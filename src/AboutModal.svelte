<script lang="ts">
  import { Modal, Button } from 'flowbite-svelte';

  /* Properties */
  export let textColorClass: string = '';

  /* State */
  let modalOpen = false;

  export function open() {
    modalOpen = true;
  }

  function handleClose() {
    modalOpen = false;
  }
</script>

<Modal bind:open={modalOpen} title="About" autoclose class="w-full sm:w-2/3">
  <div class={textColorClass}>
    <p class="text-justify">
      <span class="font-semibold">briefsky</span> is a free weather frontend to a variety of weather providers, with an interface reminiscent of the late Dark Sky.
      briefsky does not provide weather data — a weather provider must be configured in the settings.
    </p>
  </div>

  <svelte:fragment slot="footer">
    <Button on:click={handleClose} class="ml-auto">Close</Button>
  </svelte:fragment>
</Modal>
