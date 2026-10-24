from AppifyActors import get_place_details

url = "https://www.google.com/maps/place/Balboa+Cafe/@37.8026807,-122.4474707,15.78z/data=!4m10!1m2!2m1!1scafe!3m6!1s0x808580d099f77961:0xadeb037c6fe4b1f7!8m2!3d37.7988162!4d-122.4361023!15sCgRjYWZlWgYiBGNhZmWSAQpyZXN0YXVyYW50mgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDJ4d1drOVdjRTVWVldoeVdXcEdVVkpYVGsxaldGcEVUVEE1YjJOdFl4QULgAQD6AQQIQBBF!16s%2Fm%2F01zn48k?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D"
place = get_place_details(url, max_reviews=10)
for review in place["reviews"]:
    print(review["stars"], review["text"])