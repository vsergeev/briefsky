import { Location } from '../providers/Location';
import type { LocationCandidate, Geocoder } from './Geocoder';

export class NominatimGeocoder implements Geocoder {
  static description = 'OpenStreetMap';
  static attribution = 'https://www.openstreetmap.org/copyright';

  static FORWARD_ENDPOINT_URL = 'https://nominatim.openstreetmap.org/search';
  static REVERSE_ENDPOINT_URL = 'https://nominatim.openstreetmap.org/reverse';

  async forwardGeocode(query: string): Promise<LocationCandidate[]> {
    let response: Response;
    try {
      response = await fetch(
        NominatimGeocoder.FORWARD_ENDPOINT_URL +
          '?' +
          new URLSearchParams([
            ['q', query],
            ['format', 'jsonv2'],
          ]),
      );
    } catch (e) {
      throw new Error(`Fetching from Nominatim: ${e.toString()}`);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Fetching from Nominatim: Unexpected response data: ${e.toString()}`);
    }

    if (!response.ok || data.error) {
      throw new Error(`Fetching from Nominatim for query '${query}': ${data.error}`);
    }

    return data.map((e: any) => ({
      name: e.display_name,
      location: new Location(e.lat, e.lon),
    }));
  }

  async reverseGeocode(location: Location): Promise<string> {
    let response: Response;
    try {
      response = await fetch(
        NominatimGeocoder.REVERSE_ENDPOINT_URL +
          '?' +
          new URLSearchParams([
            ['lat', location.latitude],
            ['lon', location.longitude],
            ['addressdetails', '1'],
            ['zoom', '10'],
            ['format', 'jsonv2'],
          ]),
      );
    } catch (e) {
      throw new Error(`Fetching from Nominatim: ${e.toString()}`);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Fetching from Nominatim: Unexpected response data: ${e.toString()}`);
    }

    if (!response.ok || data.error) {
      throw new Error(`Error: Fetching from Nominatim for location ${location}: ${data.error}`);
    }

    return `${data.name}, ${data.address.state}`;
  }
}
