import { Location } from '../providers/Location';
import type { LocationCandidate, Geocoder } from './Geocoder';

export class ExampleGeocoder implements Geocoder {
  static description = 'Example';
  static attribution = undefined;

  async forwardGeocode(_: string): Promise<LocationCandidate[]> {
    return [
      { name: 'New York, New York', location: new Location('40.7127281', '-74.0060152') },
      { name: 'Los Angeles, California', location: new Location('34.0536909', '-118.242766') },
      { name: 'Chicago, Illinois', location: new Location('41.8755616', '-87.6244212') },
      { name: 'Houston, Texas', location: new Location('29.7589382', '-95.3676974') },
      { name: 'Phoenix, Arizona', location: new Location('33.4484367', '-112.074141') },
    ];
  }

  async reverseGeocode(_: Location): Promise<string> {
    return 'Houston, Texas';
  }
}
