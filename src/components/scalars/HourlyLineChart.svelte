<script lang="ts">
  import { Tooltip } from 'flowbite-svelte';

  /* Data Set Type */
  interface DataSet {
    values: number[];
    limit: number;
    valueFormatter: (value: number) => string;
    tooltipFormatter: (value: number, index: number) => string;
    style: {
      tickClass: string;
      fillClass: string;
      strokeClass: string;
      tooltipClass: string;
      points: boolean;
      fill: boolean;
    };
  }

  /* Basic Properties */
  export let uid: string;
  export let title: string;
  export let timestamps: Date[];
  export let datasets: DataSet[];

  /* Advanced Properties */
  export let ticks: number = 4;
  export let width: number = 1200;
  export let height: number = 125;

  /* Constants */
  const tickLength = 10;
  const pointRadius = 5;
  const xAxisMargin = 45;
  const xTickValueOffset = 10;
  const yTickValueOffset = 5;
  const xPitch = width / 24;
  const yPitch = height / ticks;
  const hoverFillClass = 'fill-red-500 dark:fill-red-500';
  const hoverStrokeClass = 'stroke-red-500 dark:stroke-red-500 stroke-[4] md:stroke-2';

  /* Hover Index State */
  let hoverIndex: number | undefined;
</script>

<div>
  <div class="w-full mb-2 text-center">
    <span class="text-base md:text-lg">{title}</span>
  </div>
  <div>
    <svg
      id={uid}
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      class="overflow-visible"
      width="100%"
      viewBox="0 0 {width} {height + xAxisMargin}"
    >
      <!-- Grid and Ticks -->
      <g class="stroke-gray-400 dark:stroke-gray-200">
        <!-- Y Axis Grid and Tick Marks -->
        {#each Array(ticks + 1) as _, i}
          <line x1={-tickLength} y1={height - i * yPitch} x2={width + tickLength} y2={height - i * yPitch} stroke-width="0.5" />
        {/each}

        <!-- X Axis Grid and Tick Marks -->
        {#each Array(25) as _, i}
          <line x1={i * xPitch} y1={-tickLength} x2={i * xPitch} y2={height + tickLength} stroke-width="0.5" />
        {/each}
      </g>

      <!-- X Axis Tick Values (Hours) -->
      <g class="fill-gray-800 dark:fill-gray-200 text-5xl sm:text-4xl md:text-2xl lg:text-xl">
        {#each [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22] as i}
          {@const hour = timestamps[i].getHours()}
          <text
            x={i * xPitch}
            y={height + tickLength + xTickValueOffset}
            text-anchor={i === 0 ? 'start' : 'middle'}
            dominant-baseline="hanging"
            class={i === 2 || i === 6 || i === 10 || i === 14 || i === 18 || i === 22 ? 'block' : 'hidden md:block'}
            >{(hour % 12 || 12) + (hour < 12 ? 'am' : 'pm')}</text
          >
        {/each}
      </g>

      <!-- Mobile Y Axis Tick Value for Data Set 0 (Left) -->
      <g class="md:hidden text-4xl {datasets[0].style.tickClass}">
        <text x={0} y={-tickLength - xTickValueOffset} text-anchor="start" dominant-baseline="text-bottom"
          >{datasets[0].valueFormatter(ticks * (datasets[0].limit / ticks))}</text
        >
      </g>

      <!-- Mobile Y Axis Tick Value for Data Set 1 (Right) -->
      {#if datasets.length > 1}
        <g class="md:hidden text-4xl {datasets[1].style.tickClass}">
          <text x={width} y={-tickLength - xTickValueOffset} text-anchor="end" dominant-baseline="text-bottom"
            >{datasets[1].valueFormatter(ticks * (datasets[1].limit / ticks))}</text
          >
        </g>
      {/if}

      <!-- Y Axis Tick Values for Data Set 0 (Left) -->
      <g class="hidden md:block md:text-xl lg:text-lg {datasets[0].style.tickClass}">
        {#each Array(ticks + 1) as _, i}
          <text x={-tickLength - yTickValueOffset} y={height - i * yPitch} text-anchor="end" dominant-baseline="central"
            >{datasets[0].valueFormatter(i * (datasets[0].limit / ticks))}</text
          >
        {/each}
      </g>

      <!-- Y Axis Tick Values for Data Set 1 (Right) -->
      {#if datasets.length > 1}
        <g class="hidden md:block md:text-xl lg:text-lg {datasets[1].style.tickClass}">
          {#each Array(ticks + 1) as _, i}
            <text x={width + tickLength + yTickValueOffset} y={height - i * yPitch} text-anchor="start" dominant-baseline="central"
              >{datasets[1].valueFormatter(i * (datasets[1].limit / ticks))}</text
            >
          {/each}
        </g>
      {/if}

      {#each datasets as dataset}
        <g>
          <!-- Fill -->
          {#if dataset.style.fill}
            <g class={dataset.style.fillClass}>
              {#each Array(dataset.values.length - 1) as _, i}
                <polygon
                  points="{i * xPitch},{height} {i * xPitch},{height - dataset.values[i] * (yPitch / (dataset.limit / ticks))}, {(i + 1) * xPitch + 0},{height -
                    dataset.values[i + 1] * (yPitch / (dataset.limit / ticks))} {(i + 1) * xPitch},{height}"
                />
              {/each}
            </g>
          {/if}

          <!-- Lines -->
          <g class={dataset.style.strokeClass}>
            {#each Array(dataset.values.length - 1) as _, i}
              <line
                x1={i * xPitch}
                y1={height - dataset.values[i] * (yPitch / (dataset.limit / ticks))}
                x2={(i + 1) * xPitch}
                y2={height - dataset.values[i + 1] * (yPitch / (dataset.limit / ticks))}
              />
            {/each}
          </g>

          <!-- Data Points -->
          <g class={dataset.style.fillClass}>
            {#each dataset.values as value, i}
              <circle
                class="data-point {hoverIndex === i ? hoverFillClass : ''}"
                cx={i * xPitch}
                cy={height - value * (yPitch / (dataset.limit / ticks))}
                data-value={value}
                r={pointRadius}
                opacity={dataset.style.points ? 1 : 0}
              />
            {/each}
          </g>
        </g>
      {/each}

      <!-- Hover Lines -->
      <g>
        {#each Array(datasets[0].values.length) as _, i}
          <line class={hoverIndex === i ? hoverStrokeClass : ''} x1={i * xPitch} y1={-tickLength} x2={i * xPitch} y2={height + tickLength} />
        {/each}
      </g>

      <!-- Hover Areas -->
      <g>
        {#each Array(datasets[0].values.length) as _, i}
          <line class="hover-region" x1={i * xPitch} y1={0} x2={i * xPitch} y2={height} stroke-width={0.8 * xPitch} stroke="gray" opacity="0" />
        {/each}
      </g>
    </svg>
    <!-- Generate tool tip for each hover region -->
    {#each Array(datasets[0].values.length) as _, i}
      <Tooltip
        triggeredBy="svg#{uid} .hover-region:nth-child({i + 1})"
        reference="svg#{uid} .data-point:nth-child({i + 1})"
        type="auto"
        placement="right"
        on:show={(ev) => {
          hoverIndex = ev.detail ? i : undefined;
        }}
      >
        {#each datasets as dataset}
          <p class={dataset.style.tooltipClass}>
            {dataset.tooltipFormatter(dataset.values[i], i)}
          </p>
        {/each}
      </Tooltip>
    {/each}
  </div>
</div>
