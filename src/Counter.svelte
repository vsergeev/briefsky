<script lang="ts">
  let count: number = 0;
  const increment = () => {
    count += 1;
  };
</script>

<button class="btn" on:click={increment}>
  count is {count}
</button>
