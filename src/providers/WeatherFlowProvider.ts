import type { Provider, CurrentWeather, DailyWeather, Weather } from './Provider';
import type { Location } from './Location';
import { ConditionsIcon } from './Provider';

const CONDITIONS_ICON_MAP: { [key: string]: ConditionsIcon } = {
  'clear-day': ConditionsIcon.Clear,
  'clear-night': ConditionsIcon.Clear,
  cloudy: ConditionsIcon.Overcast,
  foggy: ConditionsIcon.Fog,
  'partly-cloudy-day': ConditionsIcon.PartlyCloudy,
  'partly-cloudy-night': ConditionsIcon.PartlyCloudy,
  'possibly-rainy-day': ConditionsIcon.LightRain,
  'possibly-rainy-night': ConditionsIcon.LightRain,
  'possibly-sleet-day': ConditionsIcon.LightSleet,
  'possibly-sleet-night': ConditionsIcon.LightSleet,
  'possibly-snow-day': ConditionsIcon.LightSnow,
  'possibly-snow-night': ConditionsIcon.LightSnow,
  'possibly-thunderstorm-day': ConditionsIcon.Thunderstorm,
  'possibly-thunderstorm-night': ConditionsIcon.Thunderstorm,
  rainy: ConditionsIcon.Rain,
  sleet: ConditionsIcon.Sleet,
  snow: ConditionsIcon.Snow,
  thunderstorm: ConditionsIcon.Thunderstorm,
  windy: ConditionsIcon.Clear,
};

export class WeatherFlowProvider implements Provider {
  static id = 'weatherflow';
  static description = 'WeatherFlow';
  static attribution = 'https://weatherflow.com/';
  static requiresLocation = false;
  static fields = [
    { name: 'api_key', description: 'API Key' },
    { name: 'station_id', description: 'Station ID' },
  ];

  static ENDPOINT_URL = 'https://swd.weatherflow.com/swd/rest/better_forecast';

  apiKey: string;
  stationId: string;

  constructor(apiKey: string, stationId: string) {
    this.apiKey = apiKey;
    this.stationId = stationId;
  }

  async fetch(): Promise<Weather> {
    let response: Response;
    try {
      response = await fetch(WeatherFlowProvider.ENDPOINT_URL + '?' + new URLSearchParams({ station_id: this.stationId, token: this.apiKey }));
    } catch (e) {
      throw new Error(`Fetching from WeatherFlow: ${e.toString()}`);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Fetching from WeatherFlow: Unexpected response data.`);
    }

    if (!response.ok) {
      console.error(response);
      throw new Error(`Fetching from WeatherFlow: ${data.status.status_message}`);
    }

    const current: CurrentWeather = {
      timestamp: new Date(data.current_conditions.time * 1000),
      conditions: data.current_conditions.conditions,
      conditions_icon: CONDITIONS_ICON_MAP[data.current_conditions.icon] ?? ConditionsIcon.Unknown,
      temperature: data.current_conditions.air_temperature,
      temperature_low: data.forecast.daily[0].air_temp_low,
      temperature_high: data.forecast.daily[0].air_temp_high,
      feels_like_temperature: data.current_conditions.feels_like,
      dew_point_temperature: data.current_conditions.dew_point,
      relative_humidity: data.current_conditions.relative_humidity,
      wind_speed: data.current_conditions.wind_avg * (3600 / 1000),
      wind_direction: data.current_conditions.wind_direction,
      pressure: data.current_conditions.sea_level_pressure,
      uv_index: data.current_conditions.uv,
      visibility: undefined,
      hourly: data.forecast.hourly
        .filter((h: any) => h.time >= data.current_conditions.time && h.time < data.current_conditions.time + 86400)
        .map((h: any) => ({
          timestamp: new Date(h.time * 1000),
          conditions: h.conditions,
          conditions_icon: CONDITIONS_ICON_MAP[h.icon] ?? ConditionsIcon.Unknown,
          temperature: h.air_temperature,
        })),
    };

    const daily: DailyWeather[] = data.forecast.daily.map((d: any) => ({
      timestamp: new Date(d.day_start_local * 1000),
      conditions: d.conditions,
      conditions_icon: CONDITIONS_ICON_MAP[d.icon] ?? ConditionsIcon.Unknown,
      temperature_low: d.air_temp_low,
      temperature_high: d.air_temp_high,
      sunrise_timestamp: new Date(d.sunrise * 1000),
      sunset_timestamp: new Date(d.sunset * 1000),
      precipitation_probability: d.precip_probability,
      hourly: data.forecast.hourly
        .filter((h: any) => h.time >= d.day_start_local && h.time < Math.max(data.current_conditions.time, d.day_start_local) + 86400)
        .map((h: any) => ({
          timestamp: new Date(h.time * 1000),
          conditions: h.conditions,
          conditions_icon: CONDITIONS_ICON_MAP[h.icon] ?? ConditionsIcon.Unknown,
          temperature: h.air_temperature,
          wind_speed: h.wind_avg * (3600 / 1000),
          wind_direction: h.wind_direction,
        })),
    }));

    return {
      current,
      daily,
    };
  }

  static fromParams(params: { [key: string]: string }, _?: Location): Provider | null {
    if (params['api_key'] === undefined || params['station_id'] === undefined) return null;
    return new WeatherFlowProvider(params['api_key'], params['station_id']);
  }
}
