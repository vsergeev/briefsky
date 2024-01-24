export class Location {
  latitude: string;
  longitude: string;

  constructor(latitude: string, longitude: string) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  valid(): boolean {
    return this.latitude !== '' && this.longitude !== '';
  }

  toString(): string {
    return `${this.latitude},${this.longitude}`;
  }

  static fromString(location?: string): Location | null {
    if (location === undefined) return null;
    const [latitude, longitude] = location.split(',');
    return new Location((latitude || '').trim(), (longitude || '').trim());
  }

  static async fromGeolocation(): Promise<Location | null> {
    if (window.navigator.geolocation === undefined) return null;

    return new Promise(function (resolve) {
      window.navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve(new Location(position.coords.latitude.toFixed(7), position.coords.longitude.toFixed(7)));
        },
        (error: GeolocationPositionError) => {
          console.error(`Error getting geolocation: ${error.message} (${error.code})`);
          resolve(null);
        },
        { timeout: 10 * 1000 },
      );
    });
  }
}
