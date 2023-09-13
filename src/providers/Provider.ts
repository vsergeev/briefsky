import type { Location } from './Location';

export enum ConditionsIcon {
  Clear,
  PartlyCloudy,
  MostlyCloudy,
  Overcast,
  Fog,
  LightRain,
  Rain,
  LightSleet,
  Sleet,
  LightSnow,
  Snow,
  Thunderstorm,
  Unknown,
}

export enum PrecipitationType {
  None,
  Rain,
  Snow,
  Sleet,
}

export interface CurrentWeather {
  timestamp: Date;
  conditions: string;
  conditions_icon: ConditionsIcon;
  temperature: number; // in C
  temperature_low: number; // in C
  temperature_high: number; // in C
  feels_like_temperature: number; // in C
  dew_point_temperature: number; // in C
  relative_humidity: number; // in integral percent 0-100
  wind_speed: number; // in km/h
  wind_direction: number; // in degrees 0-360
  pressure: number; // in mb
  uv_index?: number; // integral 0-11
  visibility?: number; // in km
  hourly: HourlyWeather[]; // Next 24
}

export interface DailyWeather {
  timestamp: Date;
  conditions: string;
  conditions_icon: ConditionsIcon;
  temperature_low: number; // in C
  temperature_high: number; // in C
  sunrise_timestamp: Date;
  sunset_timestamp: Date;
  precipitation_probability?: number; // in integral percent 0-100
  precipitation_amount?: number; // in mm
  hourly: HourlyWeather[];
}

export interface HourlyWeather {
  timestamp: Date;
  conditions: string;
  conditions_icon: ConditionsIcon;
  temperature: number; // in C
  wind_speed?: number; // in km/h
  wind_direction?: number; // in degrees 0-360
  precipitation_probability?: number; // in integral precent 0-100
  precipitation_amount?: number; // in mm
  precipitation_type?: PrecipitationType;
}

export interface Weather {
  current: CurrentWeather;
  daily: DailyWeather[];
}

export interface ProviderFactory {
  /* Provider Specification */
  id: string;
  description: string;
  attribution: string | undefined;
  requiresLocation: boolean;
  fields: {
    name: string;
    description: string;
  }[];

  /* Provider Instantiation */
  fromParams(params: { [key: string]: string }, location?: Location): Provider | null;
}

export interface Provider {
  fetch(): Promise<Weather>;
}
