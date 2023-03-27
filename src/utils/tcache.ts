import fs from 'fs';
import path from 'path';

export default class tcache {
  val = new Map<string, string>();
  time = new Map<string, Date>();
  valPath = path.join(__dirname, 'val.json');
  timePath = path.join(__dirname, 'time.json');

  constructor() {
    this.readMaps();
  }

  readMaps() {
    // Skip if files don't exist
    if (!fs.existsSync(this.valPath) || !fs.existsSync(this.timePath)) {
      return;
    }
    const valStr = fs.readFileSync(this.valPath, 'utf8');
    const timeStr = fs.readFileSync(this.timePath, 'utf8');
    const valArr = JSON.parse(valStr);
    const timeArr = JSON.parse(timeStr);
    valArr.forEach((item: [string, string]) => this.val.set(item[0], item[1]));
    timeArr.forEach((item: [string, Date]) => this.time.set(item[0], item[1]));
  }

  writeMaps() {
    const valStr = JSON.stringify([...this.val]);
    const timeStr = JSON.stringify([...this.time]);
    fs.writeFileSync(this.valPath, valStr);
    fs.writeFileSync(this.timePath, timeStr);
  }

  /**
   * Set a value in the cache
   * @param key Key to get value for
   * @param value Value to set
   * @param ttl Number of milliseconds for time to live
   */
  set(key: string, value: string, ttl: number) {
    this.val.set(key, value);
    this.time.set(key, new Date(Date.now() + ttl));
  }

  /**
   * Fetch a value from the cache
   * @param key Key to get value for
   * @returns Value if it exists and is not expired, undefined otherwise
   */
  get(key: string) {
    const now = new Date();
    const ttl = this.time.get(key);

    if (!ttl) {
      return undefined;
    }

    const ttlDate = new Date(ttl);

    if (ttlDate > now) {
      return this.val.get(key);
    }
    return undefined;
  }
}
