export type SavedPlace = { address: string; lat: number; lng: number };

const RECENT = "coverfly.places.recent";
const HOME = "coverfly.places.home";
const WORK = "coverfly.places.work";

function read(key: string): SavedPlace | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw) as SavedPlace;
    if (typeof p.address === "string" && typeof p.lat === "number" && typeof p.lng === "number") return p;
  } catch {
    /* ignore */
  }
  return null;
}

function write(key: string, p: SavedPlace) {
  try {
    localStorage.setItem(key, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function getHomePlace(): SavedPlace | null {
  return read(HOME);
}

export function getWorkPlace(): SavedPlace | null {
  return read(WORK);
}

export function setHomePlace(p: SavedPlace) {
  write(HOME, p);
}

export function setWorkPlace(p: SavedPlace) {
  write(WORK, p);
}

export function getRecentPlaces(): SavedPlace[] {
  try {
    const raw = localStorage.getItem(RECENT);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (x): x is SavedPlace =>
        x && typeof x === "object" && typeof (x as SavedPlace).address === "string"
    ) as SavedPlace[];
  } catch {
    return [];
  }
}

export function pushRecentPlace(p: SavedPlace, max = 5) {
  const cur = getRecentPlaces().filter((x) => x.address !== p.address);
  cur.unshift(p);
  try {
    localStorage.setItem(RECENT, JSON.stringify(cur.slice(0, max)));
  } catch {
    /* ignore */
  }
}
