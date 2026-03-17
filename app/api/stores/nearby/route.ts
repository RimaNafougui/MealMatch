import { NextRequest, NextResponse } from "next/server";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface NearbyStore {
  name: string;
  type: string;
  distance_km: number;
  lat: number;
  lng: number;
  google_maps_url: string;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const STORE_TYPE_LABELS: Record<string, string> = {
  supermarket: "Supermarché",
  grocery: "Épicerie",
  convenience: "Dépanneur",
  greengrocer: "Fruiterie",
};

// GET /api/stores/nearby?lat=X&lng=Y
export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }

  // Overpass QL query: find grocery-type shops within 3 km
  const query = `[out:json][timeout:15];
(
  node["shop"~"supermarket|grocery|convenience|greengrocer"](around:3000,${lat},${lng});
  way["shop"~"supermarket|grocery|convenience|greengrocer"](around:3000,${lat},${lng});
);
out center 20;`;

  try {
    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(20_000),
    });

    if (!overpassRes.ok) {
      throw new Error(`Overpass API returned ${overpassRes.status}`);
    }

    const data = await overpassRes.json();
    const elements: OverpassElement[] = data.elements ?? [];

    const stores: NearbyStore[] = elements
      .map((el) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (elLat == null || elLng == null) return null;

        const name =
          el.tags?.["name:fr"] ?? el.tags?.name ?? "Épicerie";
        const shopType = el.tags?.shop ?? "grocery";
        const typeLabel = STORE_TYPE_LABELS[shopType] ?? "Épicerie";
        const distance = haversineKm(lat, lng, elLat, elLng);

        return {
          name,
          type: typeLabel,
          distance_km: Math.round(distance * 100) / 100,
          lat: elLat,
          lng: elLng,
          google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " épicerie")}&center=${elLat},${elLng}`,
        };
      })
      .filter((s): s is NearbyStore => s !== null)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 8);

    return NextResponse.json({ stores });
  } catch (err) {
    console.error("GET /api/stores/nearby error:", err);
    return NextResponse.json(
      { error: "Failed to fetch nearby stores" },
      { status: 500 }
    );
  }
}
