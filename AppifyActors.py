import os

from apify_client import ApifyClient
from dotenv import load_dotenv

GOOGLE_SEARCH_ACTOR_ID = "apify/google-search-scraper"
GOOGLE_MAPS_REVIEWS_ACTOR_ID = "compass/Google-Maps-Reviews-Scraper"
GOOGLE_PLACES_ACTOR_ID = "compass/crawler-google-places"

load_dotenv()
client = ApifyClient(os.environ["APIFY_API_TOKEN"])


def search_google(queries, max_pages_per_query=1, results_per_page=10, country_code="us", language_code="en"):
    run_input = {
        "queries": "\n".join(queries),
        "maxPagesPerQuery": max_pages_per_query,
        "resultsPerPage": results_per_page,
        "countryCode": country_code,
        "searchLanguage": language_code,
        "languageCode": language_code,
        "mobileResults": False,
        "saveHtml": False,
        "saveHtmlToKeyValueStore": False,
    }

    run = client.actor(GOOGLE_SEARCH_ACTOR_ID).call(run_input=run_input)
    if run is None:
        raise RuntimeError("Google Search Scraper run did not return a result")

    # Each dataset item is one page of results for one query
    return list(client.dataset(run.default_dataset_id).iterate_items())


def get_google_maps_reviews(maps_url, max_reviews=None, sort="newest", language="en"):
    run_input = {
        "startUrls": [{"url": maps_url}],
        "reviewsSort": sort,
        "language": language,
    }
    # Apify charges per review; omitting maxReviews scrapes every review for the place
    if max_reviews is not None:
        run_input["maxReviews"] = max_reviews

    run = client.actor(GOOGLE_MAPS_REVIEWS_ACTOR_ID).call(run_input=run_input)
    if run is None:
        raise RuntimeError("Google Maps Reviews Scraper run did not return a result")

    return list(client.dataset(run.default_dataset_id).iterate_items())


def print_google_maps_reviews(maps_url, max_reviews=None, sort="newest", language="en"):
    reviews = get_google_maps_reviews(maps_url, max_reviews, sort, language)
    if not reviews:
        print("No reviews found.")
        return reviews

    place = reviews[0]
    print(f"\n=== {place.get('title')} ({place.get('totalScore')} stars, {len(reviews)} reviews) ===")
    for review in reviews:
        print(f"\n{review.get('stars')}/5 - {review.get('name')} ({review.get('publishedAtDate')})")
        print(review.get("text") or "(no text)")

    return reviews


def get_place_details(maps_url, max_reviews=0, language="en"):
    run_input = {
        "startUrls": [{"url": maps_url}],
        "language": language,
        "scrapePlaceDetailPage": True,
        "maxReviews": max_reviews,
        "maxImages": 0,
        "maxQuestions": 0,
    }

    run = client.actor(GOOGLE_PLACES_ACTOR_ID).call(run_input=run_input)
    if run is None:
        raise RuntimeError("Google Places Crawler run did not return a result")

    places = list(client.dataset(run.default_dataset_id).iterate_items())
    if not places:
        raise ValueError(f"No place found for URL: {maps_url}")

    return places[0]


def search_nearby_places(latitude, longitude, radius_km, search_terms, max_per_search=20, language="en"):
    run_input = {
        "searchStringsArray": search_terms,
        # GeoJSON uses [longitude, latitude] order
        "customGeolocation": {"type": "Point", "coordinates": [longitude, latitude], "radiusKm": radius_km},
        "maxCrawledPlacesPerSearch": max_per_search,
        "language": language,
    }

    run = client.actor(GOOGLE_PLACES_ACTOR_ID).call(run_input=run_input)
    if run is None:
        raise RuntimeError("Google Places Crawler run did not return a result")

    return list(client.dataset(run.default_dataset_id).iterate_items())


if __name__ == "__main__":
    print_google_maps_reviews(
        "https://www.google.com/maps/place/Yellowstone+National+Park/@44.5857951,-110.5140571,9z/data=!3m1!4b1!4m5!3m4!1s0x5351e55555555555:0xaca8f930348fe1bb!8m2!3d44.427963!4d-110.588455",
        max_reviews=5,
    )
