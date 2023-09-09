<script lang="ts">
  export let value: number = 0;

  const COLOR_MAP: { [key: number]: string } = {
    0: 'bg-green-200 dark:bg-green-200 dark:text-gray-900',
    1: 'bg-green-200 dark:bg-green-200 dark:text-gray-900',
    2: 'bg-green-200 dark:bg-green-200 dark:text-gray-900',
    3: 'bg-yellow-300 dark:bg-yellow-300 dark:text-gray-900',
    4: 'bg-yellow-300 dark:bg-yellow-300 dark:text-gray-900',
    5: 'bg-yellow-300 dark:bg-yellow-300 dark:text-gray-900',
    6: 'bg-orange-400 dark:bg-orange-400 dark:text-gray-900',
    7: 'bg-orange-400 dark:bg-orange-400 dark:text-gray-900',
    8: 'bg-red-500 dark:bg-red-500 dark:text-gray-900',
    9: 'bg-red-500 dark:bg-red-500 dark:text-gray-900',
    10: 'bg-red-500 dark:bg-red-500 dark:text-gray-900',
    11: 'bg-violet-500 dark:bg-violet-500 dark:text-gray-900',
  };
</script>

<span class="px-1 py-0.5 rounded {COLOR_MAP[value] ?? COLOR_MAP[11]}">{value}</span>
