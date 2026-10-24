import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv

from AppifyActors import get_place_details

load_dotenv(os.path.join(os.path.dirname(__file__), "cafe-sim", ".env.local"))
SPACETIMEDB_HOST = os.environ.get("SPACETIMEDB_HOST", "https://maincloud.spacetimedb.com")
SPACETIMEDB_DB_NAME = os.environ.get("SPACETIMEDB_DB_NAME", "simulation-038f5")


def _post(path, body, content_type):
    request = urllib.request.Request(
        f"{SPACETIMEDB_HOST}/v1/database/{SPACETIMEDB_DB_NAME}/{path}",
        data=body.encode(),
        headers={"Content-Type": content_type},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request) as response:
            return response.read().decode()
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"SpacetimeDB rejected {path}: {error.code} {error.read().decode()}") from error


def call_reducer(reducer, args):
    return _post(f"call/{reducer}", json.dumps(args), "application/json")


def query_sql(sql):
    """Returns the result rows as a list of dicts keyed by column name."""
    result = json.loads(_post("sql", sql, "text/plain"))[0]
    columns = [element["name"]["some"] for element in result["schema"]["elements"]]
    return [dict(zip(columns, row)) for row in result["rows"]]


def business_exists(place_id):
    escaped = place_id.replace("'", "''")
    return bool(query_sql(f"SELECT place_id FROM business WHERE place_id = '{escaped}'"))


def business_row(place, maps_url):
    """Converts a Google Maps place from Apify into the business table's columns."""
    location = place.get("location") or {}
    return {
        "place_id": place.get("placeId") or "",
        "name": place.get("title") or "",
        "category": place.get("categoryName") or "",
        "address": place.get("address") or "",
        "phone": place.get("phone") or "",
        "website": place.get("website") or "",
        "price": place.get("price") or "",
        "latitude": float(location.get("lat") or 0),
        "longitude": float(location.get("lng") or 0),
        "rating": float(place.get("totalScore") or 0),
        "reviews_count": int(place.get("reviewsCount") or 0),
        "maps_url": maps_url,
        "details_json": json.dumps(place, default=str),
    }


def upload_business(maps_url):
    place = get_place_details(maps_url)
    call_reducer("upsert_business", business_row(place, maps_url))
    return place


if __name__ == "__main__":
    url = input("Google Maps URL for the business: ").strip()
    place = upload_business(url)
    print(f"Uploaded {place.get('title')} ({place.get('address')}) to SpacetimeDB database '{SPACETIMEDB_DB_NAME}'")
