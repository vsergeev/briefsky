import { Location } from '../providers/Location';
import type { LocationCandidate, Geocoder } from './Geocoder';

export class ExampleGeocoder implements Geocoder {
  static description = 'Example';
  static attribution = undefined;

  async forwardGeocode(query: string): Promise<LocationCandidate[]> {
    // Simulate request time
    await new Promise((resolve) => setTimeout(resolve, 750));

    if (query === 'nowhere') return [];

    if (query === 'error') throw new Error(`Fetching from ExampleGeocoder: Unexpected error`);

    return [
      { name: 'New York, New York', location: new Location('40.7127281', '-74.0060152') },
      { name: 'Los Angeles, California', location: new Location('34.0536909', '-118.242766') },
      { name: 'Chicago, Illinois', location: new Location('41.8755616', '-87.6244212') },
      { name: 'Houston, Texas', location: new Location('29.7589382', '-95.3676974') },
      { name: 'Phoenix, Arizona', location: new Location('33.4484367', '-112.074141') },
      { name: 'Philadelphia, Pennsylvania', location: new Location('39.9527237', '-75.1635262') },
      { name: 'San Antonio, Texas', location: new Location('29.4246002', '-98.4951405') },
      { name: 'San Diego, California', location: new Location('32.7174202', '-117.162772') },
    ];
  }

  async reverseGeocode(_: Location): Promise<string> {
    return 'Houston, Texas';
  }
}
