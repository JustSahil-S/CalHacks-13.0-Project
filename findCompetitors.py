import math
import re

from AppifyActors import search_nearby_places
from uploadBusiness import business_row, call_reducer, query_sql

DEFAULT_SEARCH_TERMS = ["cafe", "coffee shop", "tea house", "bubble tea", "juice bar"]

# Search terms like "tea" also return restaurants and shops that merely mention it,
# so only keep places whose primary Google category is drink-focused. Secondary
# categories are ignored because many restaurants and stores list "Cafe" as one.
DRINK_CATEGORY_PATTERN = re.compile(
    r"\b(caf[eé]s?|coffee|espresso|tea|boba|juice|smoothie|kombucha|drinks?)\b", re.IGNORECASE
)


def distance_meters(lat1, lng1, lat2, lng2):
    earth_radius = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * earth_radius * math.asin(math.sqrt(a))


def is_drink_place(place):
    return bool(DRINK_CATEGORY_PATTERN.search(place.get("categoryName") or ""))


def find_competitors(place_id, radius_km=1.0, search_terms=DEFAULT_SEARCH_TERMS, max_per_search=20):
    escaped = place_id.replace("'", "''")
    matches = query_sql(f"SELECT place_id, name, latitude, longitude FROM business WHERE place_id = '{escaped}'")
    if not matches:
        raise ValueError(f"No business with place_id {place_id}; upload it first with uploadBusiness.py")
    business = matches[0]

    places = search_nearby_places(business["latitude"], business["longitude"], radius_km, search_terms, max_per_search)

    competitors = {}
    for place in places:
        competitor_id = place.get("placeId")
        location = place.get("location") or {}
        if not competitor_id or competitor_id == place_id or competitor_id in competitors:
            continue
        if not location or place.get("permanentlyClosed") or not is_drink_place(place):
            continue
        distance = distance_meters(business["latitude"], business["longitude"], location["lat"], location["lng"])
        if distance > radius_km * 1000:
            continue
        competitors[competitor_id] = {**business_row(place, place.get("url") or ""), "distance_meters": distance}

    ranked = sorted(competitors.values(), key=lambda c: c["distance_meters"])
    call_reducer("set_competitors", {
        "place_id": place_id,
        "search_radius_meters": radius_km * 1000,
        "competitors": ranked,
    })
    return business, ranked


if __name__ == "__main__":
    businesses = query_sql("SELECT place_id, name FROM business")
    for i, b in enumerate(businesses, 1):
        print(f"{i}. {b['name']}")
    selected = businesses[int(input("Pick a business: ")) - 1]
    radius = float(input("Search radius in km [1.0]: ").strip() or 1.0)

    business, competitors = find_competitors(selected["place_id"], radius)
    print(f"\nSaved {len(competitors)} competitors within {radius} km of {business['name']}:")
    for c in competitors:
        print(f"  {c['distance_meters']:6.0f} m  {c['name']} ({c['category']}) - {c['rating']} stars, {c['reviews_count']} reviews")
