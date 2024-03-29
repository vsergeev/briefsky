# briefsky [![GitHub release](https://img.shields.io/github/release/vsergeev/briefsky.svg?maxAge=7200)](https://github.com/vsergeev/briefsky) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vsergeev/briefsky/blob/master/LICENSE)

[briefsky](https://briefsky.app/) is a free weather frontend to a variety of
weather providers, with an interface reminiscent of the late [Dark
Sky](https://darksky.net/).

briefsky retains all configuration in URL parameters, so you can bookmark
multiple locations or weather providers. briefsky is implemented as a
client-side app. It doesn't collect user information, show ads, or store
cookies.

briefsky currently supports the following weather providers:

- [Open-Meteo](https://open-meteo.com) (default)
- [Visual Crossing](https://www.visualcrossing.com/)
- [Tomorrow.io](https://www.tomorrow.io/)
- [Pirate Weather](https://pirateweather.net/)
- [WeatherFlow Tempest](https://weatherflow.github.io/Tempest/)

Some weather providers may require a free API key.

## Building

Install packages:

```
$ npm install
```

Run local development server:

```
$ npm run dev
```

Build production bundle:

```
$ npm run build
```

Preview production bundle:

```
$ npm run preview
```

Format, lint, and check:

```
$ npm run format && npm run lint && npm run check
```

## Unsupported Providers

briefsky strives to support free weather providers with open APIs or with free
API keys. However, some providers are missing weather data needed by the
frontend, or lack sufficient weather data with a free API key. Below is a list
of currently unsupported weather providers:

- [National Weather Service](https://www.weather.gov/documentation/services-web-api)
  - Missing usable condition icons
  - Missing sunrise/sunset data
- [OpenWeather](https://openweathermap.org/api)
  - Missing free daily forecast in standard API
  - Missing sufficient free hourly forecast in One Call API (only 48 hours
    free)
- [Meteomatics](https://www.meteomatics.com/en/weather-api/)
  - Does not support CORS
  - Missing apparent temperature, humidity, and dew point in free parameters
- [Weatherbit](https://www.weatherbit.io/)
  - Missing free hourly forecast
- [Weatherstack](https://weatherstack.com/)
  - Missing free daily and hourly forecast
- [Accuweather](https://developer.accuweather.com/)
  - Missing sufficient free hourly forecast (only 12 hours free)
- [Stormglass.io](https://stormglass.io/)
  - Does not provide daily forecast

## File Structure

- [src/](src/) - Sources
  - [components/](src/components/) - Components
    - [primitives/](src/components/primitives/) - Primitives
  - [providers/](src/providers/) - Weather Providers
- [public/](public/) - Static assets
- [index.html](index.html) - Top-level HTML
- [package.json](package.json) - npm package configuration
- [package-lock.json](package-lock.json) - npm package lock
- [tsconfig.json](tsconfig.json) - TypeScript (Web) configuration
- [tsconfig.node.json](tsconfig.node.json) - TypeScript (Node) configuration
- [vite.config.ts](vite.config.ts) - Vite configuration
- [svelte.config.js](svelte.config.js) - Svelte configuration
- [postcss.config.cjs](postcss.config.cjs) - PostCSS configuration
- [tailwind.config.cjs](tailwind.config.cjs) - Tailwind configuration
- [CHANGELOG](CHANGELOG.md) - Change log
- [LICENSE](LICENSE) - MIT License
- [README.md](README.md) - This README

## License

briefsky is MIT licensed. See the included [LICENSE](LICENSE) file.
