import type { Location } from '../providers/Location';

export interface LocationCandidate {
  name: string;
  location: Location;
}

export interface Geocoder {
  forwardGeocode(query: string): Promise<LocationCandidate[]>;
  reverseGeocode(location: Location): Promise<string>;
}

export interface GeocoderFactory {
  description: string;
  attribution: string | undefined;
  new (): Geocoder;
}
