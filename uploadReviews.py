import json

from AppifyActors import get_google_maps_reviews
from uploadBusiness import SPACETIMEDB_DB_NAME, business_exists, call_reducer, upload_business

MAX_REVIEWS = 10


def upload_reviews(maps_url, max_reviews=MAX_REVIEWS):
    reviews = get_google_maps_reviews(maps_url, max_reviews=max_reviews)
    if not reviews:
        print("No reviews found.")
        return []

    place_id = reviews[0].get("placeId")
    if not place_id:
        raise ValueError("Scraped reviews did not include a placeId")

    # Reviews must point at an existing business row, so add the business first if needed
    if business_exists(place_id):
        print(f"Linking reviews to existing business {reviews[0].get('title')} ({place_id})")
    else:
        print(f"{reviews[0].get('title')} is not in the business table yet, uploading it first...")
        upload_business(maps_url)

    for review in reviews:
        call_reducer("upsert_review", {
            "review_id": review.get("reviewId") or "",
            "place_id": place_id,
            "reviewer_name": review.get("name") or "",
            "reviewer_id": review.get("reviewerId") or "",
            "stars": int(review.get("stars") or 0),
            "text": review.get("text") or "",
            "published_at": review.get("publishedAtDate") or "",
            "likes_count": int(review.get("likesCount") or 0),
            "owner_response": review.get("responseFromOwnerText") or "",
            "review_url": review.get("reviewUrl") or "",
            "detailed_rating_json": json.dumps(review.get("reviewDetailedRating") or {}),
        })

    return reviews


if __name__ == "__main__":
    url = input("Google Maps URL for the business: ").strip()
    uploaded = upload_reviews(url)
    if uploaded:
        print(f"Uploaded {len(uploaded)} reviews for {uploaded[0].get('title')} to SpacetimeDB database '{SPACETIMEDB_DB_NAME}'")
