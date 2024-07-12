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

<Modal bind:open={modalOpen} title="About" autoclose class="w-full sm:w-2/3" classHeader="text-gray-900 dark:text-white">
  <div class={textColorClass}>
    <p class="text-justify">
      <span class="font-semibold">briefsky</span> is a free weather frontend to a variety of weather providers, with an interface reminiscent of the late Dark Sky.
      briefsky does not provide weather data — a weather provider must be configured in the settings.
    </p>
    <br />
    <p class="text-justify [&_a]:underline">
      briefsky is <a href="https://github.com/vsergeev/briefsky/blob/master/LICENSE">MIT licensed</a>. In addition, briefsky uses Erik Flower's Weather icons (<a
        href="https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL">Open Font License</a
      >), as well as miscellaneous icons from Radix Icons (<a href="https://github.com/radix-ui/icons/blob/master/LICENSE">MIT License</a>), Material Design
      Icons (<a href="https://github.com/Templarian/MaterialDesign/blob/master/LICENSE">Apache 2.0 License</a>), and MingCute Icons (<a
        href="https://github.com/Richard9394/MingCute/blob/main/LICENSE">Apache 2.0 License</a
      >).
    </p>
    <br />
    <p>
      <span class="font-mono">v{window.__APP_VERSION__}-{window.__APP_COMMIT_ID__}</span>
    </p>
  </div>

  <svelte:fragment slot="footer">
    <Button on:click={handleClose} class="ml-auto">Close</Button>
  </svelte:fragment>
</Modal>
