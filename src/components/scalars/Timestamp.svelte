<script lang="ts">
  export let format: string;
  export let value: Date;

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function toDayString(value: Date): string {
    return DAYS[value.getDay()];
  }

  function toHourString(value: Date): string {
    const hour = value.getHours();
    return (hour % 12 || 12) + (hour < 12 ? 'am' : 'pm');
  }
</script>

{#if format === 'day'}
  <span>{toDayString(value)}</span>
{:else if format === 'hour'}
  <span>{toHourString(value)}</span>
{:else if format === 'short'}
  <span>{value.toLocaleTimeString([], { timeStyle: 'short' })}</span>
{:else if format === 'long'}
  <span
    >{value.toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    })}</span
  >
{/if}
