import type { Provider, CurrentWeather, DailyWeather, Weather } from './Provider';
import { ConditionsIcon } from './Provider';

const CONDITIONS_ICON_MAP: { [key: string]: ConditionsIcon } = {
  snow: ConditionsIcon.Snow,
  'snow-showers-day': ConditionsIcon.Snow,
  'snow-showers-night': ConditionsIcon.Snow,
  'thunder-rain': ConditionsIcon.Thunderstorm,
  'thunder-showers-day': ConditionsIcon.Thunderstorm,
  'thunder-showers-night': ConditionsIcon.Thunderstorm,
  rain: ConditionsIcon.Rain,
  'showers-day': ConditionsIcon.Rain,
  'showers-night': ConditionsIcon.Rain,
  fog: ConditionsIcon.Fog,
  wind: ConditionsIcon.Clear,
  cloudy: ConditionsIcon.Overcast,
  'partly-cloudy-day': ConditionsIcon.PartlyCloudy,
  'partly-cloudy-night': ConditionsIcon.PartlyCloudy,
  'clear-day': ConditionsIcon.Clear,
  'clear-night': ConditionsIcon.Clear,
};

export class VisualCrossingProvider implements Provider {
  static id = 'visualcrossing';
  static description = 'Visual Crossing';
  static attribution = 'https://www.visualcrossing.com/';
  static fields = [
    { name: 'api_key', description: 'API Key' },
    { name: 'location', description: 'Location' },
  ];

  static ENDPOINT_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

  apiKey: string;
  location: string;

  constructor(apiKey: string, location: string) {
    this.apiKey = apiKey;
    this.location = location;
  }

  async fetch(): Promise<Weather> {
    let response: Response;
    try {
      response = await fetch(
        VisualCrossingProvider.ENDPOINT_URL +
          encodeURIComponent(this.location) +
          '?' +
          new URLSearchParams({ unitGroup: 'metric', key: this.apiKey, iconSet: 'icons2' })
      );
    } catch (e) {
      throw new Error(`Fetching from Visual Crossing: ${e.toString()}`);
    }

    if (!response.ok) {
      throw new Error(`Fetching from Visual Crossing: ${await response.text()}`);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Fetching from Visual Crossing: Unexpected response data.`);
    }

    const current: CurrentWeather = {
      timestamp: new Date(data.currentConditions.datetimeEpoch * 1000),
      conditions: data.currentConditions.conditions,
      conditions_icon: CONDITIONS_ICON_MAP[data.currentConditions.icon] ?? ConditionsIcon.Unknown,
      temperature: data.currentConditions.temp,
      temperature_low: data.days[0].tempmin,
      temperature_high: data.days[0].tempmax,
      feels_like_temperature: data.currentConditions.feelslike,
      dew_point_temperature: data.currentConditions.dew,
      relative_humidity: data.currentConditions.humidity,
      wind_speed: data.currentConditions.windspeed,
      wind_direction: data.currentConditions.winddir,
      pressure: data.currentConditions.pressure,
      uv_index: data.currentConditions.uvindex,
      visibility: data.currentConditions.visibility,
      hourly: data.days[0].hours
        .concat(data.days[1].hours)
        .filter((h: any) => h.datetimeEpoch >= data.currentConditions.datetimeEpoch && h.datetimeEpoch < data.currentConditions.datetimeEpoch + 86400)
        .map((h: any) => ({
          timestamp: new Date(h.datetimeEpoch * 1000),
          conditions: h.conditions,
          conditions_icon: CONDITIONS_ICON_MAP[h.icon] ?? ConditionsIcon.Unknown,
          temperature: h.temp,
        })),
    };

    const daily: DailyWeather[] = data.days
      .filter((d: any) => data.currentConditions.datetimeEpoch - d.datetimeEpoch < 20 * 3600)
      .slice(0, 10)
      .map((d: any) => ({
        timestamp: new Date(d.datetimeEpoch * 1000),
        conditions: d.conditions,
        conditions_icon: CONDITIONS_ICON_MAP[d.icon] ?? ConditionsIcon.Unknown,
        temperature_low: d.tempmin,
        temperature_high: d.tempmax,
        sunrise_timestamp: new Date(d.sunriseEpoch * 1000),
        sunset_timestamp: new Date(d.sunsetEpoch * 1000),
        precipitation_probability: d.precipprob,
        precipitation_amount: d.precip,
        hourly: d.hours
          .filter((h: any) => h.datetimeEpoch >= d.datetimeEpoch && h.datetimeEpoch < Math.max(data.currentConditions.datetimeEpoch, d.datetimeEpoch) + 86400)
          .map((h: any) => ({
            timestamp: new Date(h.datetimeEpoch * 1000),
            conditions: h.conditions,
            conditions_icon: CONDITIONS_ICON_MAP[h.icon] ?? ConditionsIcon.Unknown,
            temperature: h.temp,
          })),
      }));

    return {
      current,
      daily,
    };
  }

  static fromParams(params: object): Provider | null {
    if (params['api_key'] === undefined || params['location'] === undefined) return null;
    return new VisualCrossingProvider(params['api_key'], params['location']);
  }
}
