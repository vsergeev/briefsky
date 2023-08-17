import type { Provider, CurrentWeather, DailyWeather, Weather } from './Provider';
import type { Location } from './Location';
import { ConditionsIcon } from './Provider';

const CONDITIONS_TEXT_MAP: { [key: string]: string } = {
  '1000': 'Clear, Sunny',
  '1100': 'Mostly Clear',
  '1101': 'Partly Cloudy',
  '1102': 'Mostly Cloudy',
  '1001': 'Cloudy',
  '2000': 'Fog',
  '2100': 'Light Fog',
  '4000': 'Drizzle',
  '4001': 'Rain',
  '4200': 'Light Rain',
  '4201': 'Heavy Rain',
  '5000': 'Snow',
  '5001': 'Flurries',
  '5100': 'Light Snow',
  '5101': 'Heavy Snow',
  '6000': 'Freezing Drizzle',
  '6001': 'Freezing Rain',
  '6200': 'Light Freezing Rain',
  '6201': 'Heavy Freezing Rain',
  '7000': 'Ice Pellets',
  '7101': 'Heavy Ice Pellets',
  '7102': 'Light Ice Pellets',
  '8000': 'Thunderstorm',
};

const CONDITIONS_ICON_MAP: { [key: string]: ConditionsIcon } = {
  '1000': ConditionsIcon.Clear,
  '1100': ConditionsIcon.Clear,
  '1101': ConditionsIcon.PartlyCloudy,
  '1102': ConditionsIcon.MostlyCloudy,
  '1001': ConditionsIcon.Overcast,
  '2000': ConditionsIcon.Fog,
  '2100': ConditionsIcon.Fog,
  '4000': ConditionsIcon.LightRain,
  '4001': ConditionsIcon.Rain,
  '4200': ConditionsIcon.LightRain,
  '4201': ConditionsIcon.Rain,
  '5000': ConditionsIcon.Snow,
  '5001': ConditionsIcon.LightSnow,
  '5100': ConditionsIcon.LightSnow,
  '5101': ConditionsIcon.Snow,
  '6000': ConditionsIcon.LightSleet,
  '6001': ConditionsIcon.LightSleet,
  '6200': ConditionsIcon.LightSleet,
  '6201': ConditionsIcon.Sleet,
  '7000': ConditionsIcon.Sleet,
  '7101': ConditionsIcon.Sleet,
  '7102': ConditionsIcon.Sleet,
  '8000': ConditionsIcon.Thunderstorm,
};

export class TomorrowIoProvider implements Provider {
  static id = 'tomorrowio';
  static description = 'Tomorrow.io';
  static attribution = 'https://www.tomorrow.io/';
  static requiresLocation = true;
  static fields = [{ name: 'api_key', description: 'API Key' }];

  static ENDPOINT_URL = 'https://api.tomorrow.io/v4/timelines';
  static FIELDS = [
    'weatherCode',
    'temperature',
    'temperatureMin',
    'temperatureMax',
    'temperatureApparent',
    'dewPoint',
    'humidity',
    'windSpeed',
    'windDirection',
    'pressureSeaLevel',
    'uvIndex',
    'visibility',
    'sunriseTime',
    'sunsetTime',
    'precipitationProbability',
  ];

  apiKey: string;
  location: Location;

  constructor(apiKey: string, location: Location) {
    this.apiKey = apiKey;
    this.location = location;
  }

  async fetch(): Promise<Weather> {
    let response: Response;
    try {
      response = await fetch(
        TomorrowIoProvider.ENDPOINT_URL +
          '?' +
          new URLSearchParams(
            [
              ['location', `${this.location.latitude},${this.location.longitude}`],
              ['apikey', this.apiKey],
              ['units', 'metric'],
              ['timesteps', 'current'],
              ['timesteps', '1d'],
              ['timesteps', '1h'],
              ['startTime', 'nowMinus6h'],
              ['endTime', 'nowPlus5d'],
            ].concat(TomorrowIoProvider.FIELDS.map((f) => ['fields', f]))
          )
      );
    } catch (e) {
      throw new Error(`Fetching from Tomorrow.io: ${e.toString()}`);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Fetching from Tomorrow.io: Unexpected response data.`);
    }

    if (!response.ok) {
      throw new Error(`Fetching from Tomorrow.io: ${data.message}`);
    }

    const currentData = data.data.timelines.find((timeline: any) => timeline.timestep === 'current').intervals[0];
    const dailyData = data.data.timelines.find((timeline: any) => timeline.timestep === '1d').intervals;
    const hourlyData = data.data.timelines.find((timeline: any) => timeline.timestep === '1h').intervals;

    const dateToTimestamp = (date: Date | string) => new Date(date).getTime() / 1000;
    const adjustDateToMidnight = (date: Date) => new Date(date.getTime() - 6 * 3600 * 1000);

    const currentTime = new Date(currentData.startTime);

    const current: CurrentWeather = {
      timestamp: new Date(currentData.startTime),
      conditions: CONDITIONS_TEXT_MAP[currentData.values.weatherCode] ?? 'Unknown',
      conditions_icon: CONDITIONS_ICON_MAP[currentData.values.weatherCode] ?? ConditionsIcon.Unknown,
      temperature: currentData.values.temperature,
      temperature_low: dailyData[0].values.temperatureMin,
      temperature_high: dailyData[0].values.temperatureMax,
      feels_like_temperature: currentData.values.temperatureApparent,
      dew_point_temperature: currentData.values.dewPoint,
      relative_humidity: currentData.values.humidity,
      wind_speed: currentData.values.windSpeed * (3600 / 1000),
      wind_direction: currentData.values.windDirection,
      pressure: currentData.values.pressureSeaLevel,
      uv_index: currentData.values.uvIndex,
      visibility: currentData.values.visibility,
      hourly: hourlyData
        .filter((h: any) => dateToTimestamp(h.startTime) >= dateToTimestamp(currentTime) && dateToTimestamp(h.startTime) < dateToTimestamp(currentTime) + 86400)
        .map((h: any) => ({
          timestamp: new Date(h.startTime),
          conditions: CONDITIONS_TEXT_MAP[h.values.weatherCode] ?? 'Unknown',
          conditions_icon: CONDITIONS_ICON_MAP[h.values.weatherCode] ?? ConditionsIcon.Unknown,
          temperature: h.values.temperature,
        })),
    };

    const daily: DailyWeather[] = dailyData
      .filter((d: any) => dateToTimestamp(currentTime) - dateToTimestamp(adjustDateToMidnight(new Date(d.startTime))) < 20 * 3600)
      .map((d: any) => ({
        timestamp: new Date(d.startTime),
        conditions: CONDITIONS_TEXT_MAP[d.values.weatherCode] ?? 'Unknown',
        conditions_icon: CONDITIONS_ICON_MAP[d.values.weatherCode] ?? ConditionsIcon.Unknown,
        temperature_low: 0 /* Derive from hourly data */,
        temperature_high: 0 /* Derive from hourly data */,
        sunrise_timestamp: new Date(d.values.sunriseTime),
        sunset_timestamp: new Date(d.values.sunsetTime),
        precipitation_probability: d.values.precipitationProbability,
        hourly: hourlyData
          .filter(
            (h: any) =>
              dateToTimestamp(h.startTime) >= Math.max(dateToTimestamp(adjustDateToMidnight(new Date(d.startTime))), dateToTimestamp(currentTime)) &&
              dateToTimestamp(h.startTime) < Math.max(dateToTimestamp(adjustDateToMidnight(new Date(d.startTime))), dateToTimestamp(currentTime)) + 86400
          )
          .map((h: any) => ({
            timestamp: new Date(h.startTime),
            conditions: CONDITIONS_TEXT_MAP[h.values.weatherCode] ?? 'Unknown',
            conditions_icon: CONDITIONS_ICON_MAP[h.values.weatherCode] ?? ConditionsIcon.Unknown,
            temperature: h.values.temperature,
            wind_speed: h.values.windSpeed * (3600 / 1000),
            wind_direction: h.values.windDirection,
          })),
      }))
      .filter((d: any) => d.hourly.length === 24);

    /* Update temperature low and high based on hourly data, since Tomorrow.Io returns 6am-6am days */
    for (const day of daily) {
      day.temperature_low = Math.min(...day.hourly.map((h) => h.temperature));
      day.temperature_high = Math.max(...day.hourly.map((h) => h.temperature));
    }

    return {
      current,
      daily,
    };
  }

  static fromParams(params: object, location?: Location): Provider | null {
    if (params['api_key'] === undefined || location === undefined) return null;
    return new TomorrowIoProvider(params['api_key'], location);
  }
}
