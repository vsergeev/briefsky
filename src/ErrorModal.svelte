<script lang="ts">
  import { Modal, Button } from 'flowbite-svelte';

  /* Properties */
  export let textColorClass: string = '';

  /* State */
  let modalOpen = false;
  let title: string = '';
  let message: string = '';

  export function open(_title: string, _message: string) {
    modalOpen = true;
    title = _title;
    message = _message;
  }

  function handleClose() {
    modalOpen = false;
  }
</script>

<Modal bind:open={modalOpen} size="sm" class="w-full p-2" autoclose>
  <svelte:fragment slot="header">
    <span class="text-xl font-semibold {textColorClass}">{title}</span>
  </svelte:fragment>

  <p class="text-lg {textColorClass}">
    <span class="font-semibold">Error: </span>{message}
  </p>

  <svelte:fragment slot="footer">
    <Button on:click={handleClose} color="light" class="ml-auto">Close</Button>
  </svelte:fragment>
</Modal>
