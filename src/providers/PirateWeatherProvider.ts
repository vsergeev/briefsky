import type { Provider, CurrentWeather, DailyWeather, Weather } from './Provider';
import type { Location } from './Location';
import { ConditionsIcon } from './Provider';

const CONDITIONS_ICON_MAP: { [key: string]: ConditionsIcon } = {
  'clear-day': ConditionsIcon.Clear,
  'clear-night': ConditionsIcon.Clear,
  rain: ConditionsIcon.Rain,
  snow: ConditionsIcon.Snow,
  sleet: ConditionsIcon.Sleet,
  wind: ConditionsIcon.Clear,
  fog: ConditionsIcon.Fog,
  cloudy: ConditionsIcon.Overcast,
  'partly-cloudy-day': ConditionsIcon.PartlyCloudy,
  'partly-cloudy-night': ConditionsIcon.PartlyCloudy,
};

export class PirateWeatherProvider implements Provider {
  static id = 'pirateweather';
  static description = 'Pirate Weather';
  static attribution = 'https://pirateweather.net/';
  static requiresLocation = true;
  static fields = [{ name: 'api_key', description: 'API Key' }];

  static ENDPOINT_URL = 'https://api.pirateweather.net/forecast';

  api_key: string;
  location: Location;

  constructor(api_key: string, location: Location) {
    this.api_key = api_key;
    this.location = location;
  }

  async fetch(): Promise<Weather> {
    let response: Response;
    try {
      response = await fetch(
        `${PirateWeatherProvider.ENDPOINT_URL}/${this.api_key}/${this.location.latitude},${this.location.longitude}?` +
          new URLSearchParams({ exclude: 'minutely', units: 'si', extend: 'hourly' }),
      );
    } catch (e) {
      throw new Error(`Fetching from Pirate Weather: ${e.toString()}`);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Fetching from Pirate Weather: Unexpected response data.`);
    }

    if (!response.ok) {
      throw new Error(`Fetching from Pirate Weather: ${data.reason}`);
    }

    const current: CurrentWeather = {
      timestamp: new Date(data.currently.time * 1000),
      conditions: data.currently.summary,
      conditions_icon: CONDITIONS_ICON_MAP[data.currently.icon] ?? ConditionsIcon.Unknown,
      temperature: data.currently.temperature,
      temperature_low: 0 /* Derive from hourly, since temperatureMin only applies to remainder of day */,
      temperature_high: 0 /* Derive from hourly, since temperatureMax only applies to remainder of day */,
      feels_like_temperature: data.currently.apparentTemperature,
      dew_point_temperature: data.currently.dewPoint,
      relative_humidity: Math.round(data.currently.humidity * 100),
      wind_speed: data.currently.windSpeed * (3600 / 1000),
      wind_direction: data.currently.windBearing,
      pressure: data.currently.pressure,
      visibility: data.currently.visibility,
      uv_index: Math.round(data.currently.uvIndex),
      hourly: data.hourly.data
        .filter((h: any) => h.time >= data.currently.time && h.time < data.currently.time + 86400)
        .map((h: any) => ({
          timestamp: new Date(h.time * 1000),
          conditions: h.summary,
          conditions_icon: CONDITIONS_ICON_MAP[h.icon] ?? ConditionsIcon.Unknown,
          temperature: h.temperature,
        })),
    };

    /* Update temperature low and highs */
    current.temperature_low = Math.min(...current.hourly.map((h) => h.temperature));
    current.temperature_high = Math.max(...current.hourly.map((h) => h.temperature));

    const daily: DailyWeather[] = data.daily.data
      .filter((d: any) => data.currently.time - d.time < 20 * 3600)
      .map((d: any) => ({
        timestamp: new Date(d.time * 1000),
        conditions: d.summary,
        conditions_icon: CONDITIONS_ICON_MAP[d.icon] ?? ConditionsIcon.Unknown,
        temperature_low: d.temperatureMin,
        temperature_high: d.temperatureMax,
        sunrise_timestamp: new Date(d.sunriseTime * 1000),
        sunset_timestamp: new Date(d.sunsetTime * 1000),
        precipitation_probability: Math.round(d.precipProbability * 100),
        precipitation_amount: d.precipAccumulation,
        hourly: data.hourly.data
          .filter((h: any) => h.time >= Math.max(d.time, data.currently.time) && h.time < Math.max(data.currently.time, d.time) + 86400)
          .map((h: any) => ({
            timestamp: new Date(h.time * 1000),
            conditions: h.summary,
            conditions_icon: CONDITIONS_ICON_MAP[h.icon] ?? ConditionsIcon.Unknown,
            temperature: h.temperature,
            wind_speed: h.windSpeed * (3600 / 1000),
            wind_direction: h.windBearing,
          })),
      }))
      .filter((d: DailyWeather) => d.hourly.length === 24);

    /* Update temperature low and highs for daily 0, since temperature{Min,Max} only applies to remainder of day */
    daily[0].temperature_low = Math.min(...daily[0].hourly.map((h) => h.temperature));
    daily[0].temperature_high = Math.max(...daily[0].hourly.map((h) => h.temperature));

    return {
      current,
      daily,
    };
  }

  static fromParams(params: { [key: string]: string }, location?: Location): Provider | null {
    if (params['api_key'] === undefined || location === undefined) return null;
    return new PirateWeatherProvider(params['api_key'], location);
  }
}
