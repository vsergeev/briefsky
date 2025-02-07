import type { Provider, CurrentWeather, DailyWeather, Weather } from './Provider';
import type { Location } from './Location';
import { ConditionsIcon, PrecipitationType } from './Provider';

const CONDITIONS_TEXT_MAP: { [key: string]: string } = {
  '0': 'Clear Sky',
  '1': 'Mainly Clear',
  '2': 'Partly Cloudy',
  '3': 'Overcast',
  '45': 'Fog',
  '48': 'Freezing Fog',
  '51': 'Light Drizzle',
  '53': 'Moderate Drizzle',
  '55': 'Dense Drizzle',
  '56': 'Light Freezing Drizzle',
  '57': 'Dense Freezing Drizzle',
  '61': 'Slight Rain',
  '63': 'Moderate Rain',
  '65': 'Heavy Rain',
  '66': 'Light Freezing Rain',
  '67': 'Heavy Freezing Rain',
  '71': 'Slight Snow',
  '73': 'Moderate Snow',
  '75': 'Heavy Snow',
  '77': 'Snow Grains',
  '80': 'Slight Rain Showers',
  '81': 'Moderate Rain Showers',
  '82': 'Violent Rain Showers',
  '85': 'Slight Snow Showers',
  '86': 'Heavy Snow Showers',
  '95': 'Thunderstorm',
  '96': 'Thunderstorm with Slight Hail',
  '99': 'Thunderstorm with Heavy Hail',
};

const CONDITIONS_ICON_MAP: { [key: string]: ConditionsIcon } = {
  '0': ConditionsIcon.Clear,
  '1': ConditionsIcon.Clear,
  '2': ConditionsIcon.PartlyCloudy,
  '3': ConditionsIcon.Overcast,
  '45': ConditionsIcon.Fog,
  '48': ConditionsIcon.Fog,
  '51': ConditionsIcon.LightRain,
  '53': ConditionsIcon.LightRain,
  '55': ConditionsIcon.LightRain,
  '56': ConditionsIcon.LightSleet,
  '57': ConditionsIcon.LightSleet,
  '61': ConditionsIcon.LightRain,
  '63': ConditionsIcon.Rain,
  '65': ConditionsIcon.Rain,
  '66': ConditionsIcon.LightSleet,
  '67': ConditionsIcon.Sleet,
  '71': ConditionsIcon.LightSnow,
  '73': ConditionsIcon.Snow,
  '75': ConditionsIcon.Snow,
  '77': ConditionsIcon.LightSnow,
  '80': ConditionsIcon.LightRain,
  '81': ConditionsIcon.Rain,
  '82': ConditionsIcon.Rain,
  '85': ConditionsIcon.LightSnow,
  '86': ConditionsIcon.Snow,
  '95': ConditionsIcon.Thunderstorm,
  '96': ConditionsIcon.Thunderstorm,
  '99': ConditionsIcon.Thunderstorm,
};

export class OpenMeteoProvider implements Provider {
  static id = 'openmeteo';
  static description = 'Open-Meteo';
  static attribution = 'https://open-meteo.com';
  static requiresLocation = true;
  static fields = [];

  static ENDPOINT_URL = 'https://api.open-meteo.com/v1/forecast';
  static DAILY_FIELDS = ['weathercode', 'temperature_2m_max', 'temperature_2m_min', 'sunrise', 'sunset', 'precipitation_probability_max', 'precipitation_sum'];
  static HOURLY_FIELDS = [
    'temperature_2m',
    'relativehumidity_2m',
    'dewpoint_2m',
    'apparent_temperature',
    'weathercode',
    'pressure_msl',
    'visibility',
    'windspeed_10m',
    'winddirection_10m',
    'precipitation_probability',
    'precipitation',
    'snowfall',
    'rain',
    'showers',
  ];

  location: Location;

  constructor(location: Location) {
    this.location = location;
  }

  async fetch(): Promise<Weather> {
    const currentTimestamp = Date.now();
    const startDate = new Date(currentTimestamp - 86400 * 1000).toISOString().split('T')[0];
    const endDate = new Date(currentTimestamp + 8 * 86400 * 1000).toISOString().split('T')[0];

    let response: Response;
    try {
      response = await fetch(
        OpenMeteoProvider.ENDPOINT_URL +
          '?' +
          new URLSearchParams(
            [
              ['latitude', this.location.latitude],
              ['longitude', this.location.longitude],
              ['timezone', 'auto'],
              ['timeformat', 'unixtime'],
              ['start_date', startDate],
              ['end_date', endDate],
              ['current_weather', 'true'],
            ]
              .concat(OpenMeteoProvider.DAILY_FIELDS.map((f) => ['daily', f]))
              .concat(OpenMeteoProvider.HOURLY_FIELDS.map((f) => ['hourly', f])),
          ),
      );
    } catch (e) {
      throw new Error(`Fetching from Open-Meteo: ${e.toString()}`);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Fetching from Open-Meteo: Unexpected response data: ${e.toString()}`);
    }

    if (!response.ok) {
      throw new Error(`Fetching from Open-Meteo: ${data.reason}`);
    }

    const dailyData = Array.from(Array(data.daily.time.length).keys()).map((i) =>
      Object.fromEntries(Object.keys(data.daily).map((k) => [k, data.daily[k][i]])),
    );
    const hourlyData = Array.from(Array(data.hourly.time.length).keys()).map((i) =>
      Object.fromEntries(Object.keys(data.hourly).map((k) => [k, data.hourly[k][i]])),
    );

    const currentDailyIndex = data.current_weather.time < data.daily.time[1] ? 0 : 1;
    const currentHourlyIndex = data.hourly.time
      .map((t: any, i: number) => [Math.abs(t - data.current_weather.time), i])
      .sort((a: [number, number], b: [number, number]) => a[0] > b[0])[0][1];

    const current: CurrentWeather = {
      timestamp: new Date(data.current_weather.time * 1000),
      conditions: CONDITIONS_TEXT_MAP[data.current_weather.weathercode] ?? 'Unknown',
      conditions_icon: CONDITIONS_ICON_MAP[data.current_weather.weathercode] ?? ConditionsIcon.Unknown,
      temperature: data.current_weather.temperature,
      temperature_low: data.daily.temperature_2m_min[currentDailyIndex],
      temperature_high: data.daily.temperature_2m_max[currentDailyIndex],
      feels_like_temperature: data.hourly.apparent_temperature[currentHourlyIndex],
      dew_point_temperature: data.hourly.dewpoint_2m[currentHourlyIndex],
      relative_humidity: data.hourly.relativehumidity_2m[currentHourlyIndex],
      wind_speed: data.current_weather.windspeed,
      wind_direction: data.current_weather.winddirection,
      pressure: data.hourly.pressure_msl[currentHourlyIndex],
      visibility: data.hourly.visibility[currentHourlyIndex] / 1000,
      hourly: hourlyData
        .filter((h: any) => h.time >= data.current_weather.time && h.time < data.current_weather.time + 90000)
        .map((h: any) => ({
          timestamp: new Date(h.time * 1000),
          conditions: CONDITIONS_TEXT_MAP[h.weathercode] ?? 'Unknown',
          conditions_icon: CONDITIONS_ICON_MAP[h.weathercode] ?? ConditionsIcon.Unknown,
          temperature: h.temperature_2m,
        })),
    };

    const daily: DailyWeather[] = dailyData
      .filter((d: any) => data.current_weather.time - d.time < 20 * 3600)
      .map((d: any) => ({
        timestamp: new Date(d.time * 1000),
        conditions: CONDITIONS_TEXT_MAP[d.weathercode] ?? 'Unknown',
        conditions_icon: CONDITIONS_ICON_MAP[d.weathercode] ?? ConditionsIcon.Unknown,
        temperature_low: d.temperature_2m_min,
        temperature_high: d.temperature_2m_max,
        sunrise_timestamp: new Date(d.sunrise * 1000),
        sunset_timestamp: new Date(d.sunset * 1000),
        precipitation_probability: d.precipitation_probability_max,
        precipitation_amount: d.precipitation_sum,
        hourly: hourlyData
          .filter((h: any) => h.time >= d.time && h.time < d.time + 86400)
          .map((h: any) => ({
            timestamp: new Date(h.time * 1000),
            conditions: CONDITIONS_TEXT_MAP[h.weathercode] ?? 'Unknown',
            conditions_icon: CONDITIONS_ICON_MAP[h.weathercode] ?? ConditionsIcon.Unknown,
            temperature: h.temperature_2m,
            wind_speed: h.windspeed_10m,
            wind_direction: h.winddirection_10m,
            precipitation_probability: h.precipitation_probability,
            precipitation_amount: h.precipitation,
            precipitation_type:
              h.precipitation === 0 ? PrecipitationType.None : h.snowfall > h.rain + h.showers ? PrecipitationType.Snow : PrecipitationType.Rain,
          })),
      }));

    return {
      current,
      daily,
    };
  }

  static fromParams(_: { [key: string]: string }, location?: Location): Provider | null {
    if (location === undefined) return null;
    return new OpenMeteoProvider(location);
  }
}
