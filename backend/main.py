from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
import feedparser

app = FastAPI(title="ভূমিকম্প কবে? API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MIN_LAT, MAX_LAT = -11.0, 81.0
MIN_LON, MAX_LON = 26.0, 180.0
USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"

try:
    model = joblib.load('ml_model/asia_predictor.joblib')
    model_features = joblib.load('ml_model/asia_model_features.joblib')
    print("ML model loaded successfully.")
except Exception as e:
    print(f"Error loading ML model: {e}")
    model = None
    model_features = None


@app.get("/")
def read_root():
    return {"message": "Welcome to ভূমিকম্প কবে? API. Visit /docs for documentation."}


@app.get("/api/earthquakes/recent")
def get_recent_earthquakes(days: int = 30, min_magnitude: float = 4.0):
    params = {
        "format": "geojson",
        "starttime": (datetime.now(timezone.utc) - timedelta(days=days)).isoformat(),
        "endtime": datetime.now(timezone.utc).isoformat(),
        "minlatitude": MIN_LAT,
        "maxlatitude": MAX_LAT,
        "minlongitude": MIN_LON,
        "maxlongitude": MAX_LON,
        "minmagnitude": min_magnitude
    }
    response = requests.get(USGS_API_URL, params=params)
    response.raise_for_status()
    return response.json()


@app.get("/api/predict")
def predict_earthquake_forecast():
    if not model:
        return {"error": "পূর্বাভাস মডেলটি এই মুহূর্তে পাওয়া যাচ্ছে না।"}

    params = {
        "format": "geojson",
        "starttime": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
        "endtime": datetime.now(timezone.utc).isoformat(),
        "minlatitude": MIN_LAT,
        "maxlatitude": MAX_LAT,
        "minlongitude": MIN_LON,
        "maxlongitude": MAX_LON,
        "minmagnitude": 4.0
    }

    response = requests.get(USGS_API_URL, params=params)
    data = response.json()

    if len(data['features']) < 10:
        return {"prediction": "নির্ভরযোগ্য পূর্বাভাস দেওয়ার জন্য পর্যাপ্ত তথ্য নেই।"}

    recent_quakes = sorted(data['features'], key=lambda x: x['properties']['time'])
    mags = [q['properties']['mag'] for q in recent_quakes]

    num_quakes = len(mags)
    avg_mag = np.mean(mags)
    max_mag = np.max(mags)

    last_quake_time = recent_quakes[-1]['properties']['time']
    time_since_last = (datetime.utcnow().timestamp() * 1000 - last_quake_time) / (1000 * 60 * 60)

    prediction_df = pd.DataFrame([[num_quakes, avg_mag, max_mag, time_since_last]], columns=model_features)
    predicted_magnitude = model.predict(prediction_df)[0]

    location_counts = {}
    for quake in recent_quakes[-20:]:
        place = quake['properties']['place']
        region = place.split(' of ')[-1].strip() if ' of ' in place else place.strip()
        location_counts[region] = location_counts.get(region, 0) + 1

    predicted_area = max(location_counts, key=location_counts.get) if location_counts else "এশিয়া"
    area_count = location_counts.get(predicted_area, 0)

    return {
        "prediction": f"আগামী ৭ দিনে সর্বোচ্চ সম্ভাব্য কম্পনের মাত্রা: {predicted_magnitude:.1f}",
        "predicted_area": predicted_area,
        "area_activity": f"সাম্প্রতিক {area_count}টি ভূমিকম্প এই অঞ্চলে হয়েছে",
        "disclaimer": "এটি শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে তৈরি একটি সরলীকৃত পূর্বাভাস।",
        "data_points_used": num_quakes
    }


@app.get("/api/predict/country")
def predict_earthquake_by_country(country: str):
    if not model:
        return {"error": "পূর্বাভাস মডেলটি এই মুহূর্তে পাওয়া যাচ্ছে না।"}

    params = {
        "format": "geojson",
        "starttime": (datetime.now(timezone.utc) - timedelta(days=90)).isoformat(),
        "endtime": datetime.now(timezone.utc).isoformat(),
        "minmagnitude": 2.5
    }

    response = requests.get(USGS_API_URL, params=params)
    data = response.json()

    country_quakes = [
        q for q in data['features']
        if country.lower() in q['properties']['place'].lower()
    ]

    if len(country_quakes) < 3:
        return {
            "error": f"'{country}' এ পর্যাপ্ত ভূমিকম্পের তথ্য পাওয়া যায়নি।",
            "country": country,
            "quakes_found": len(country_quakes)
        }

    mags = [q['properties']['mag'] for q in country_quakes]
    num_quakes = len(mags)
    avg_mag = np.mean(mags)
    max_mag = np.max(mags)

    region_coords = {}
    for quake in country_quakes:
        place = quake['properties']['place']
        coords = quake['geometry']['coordinates']
        region = place.split(' of ')[-1].strip() if ' of ' in place else place.strip()

        if region not in region_coords:
            region_coords[region] = {'count': 0, 'lats': [], 'lons': [], 'mags': []}

        region_coords[region]['count'] += 1
        region_coords[region]['lats'].append(coords[1])
        region_coords[region]['lons'].append(coords[0])
        region_coords[region]['mags'].append(quake['properties']['mag'])

    most_active_region = max(region_coords.keys(), key=lambda r: region_coords[r]['count'])
    region_data = region_coords[most_active_region]

    center_lat = np.mean(region_data['lats'])
    center_lon = np.mean(region_data['lons'])

    last_quake_time = max(q['properties']['time'] for q in country_quakes)
    time_since_last = (datetime.utcnow().timestamp() * 1000 - last_quake_time) / (1000 * 60 * 60)

    prediction_df = pd.DataFrame([[num_quakes, avg_mag, max_mag, time_since_last]], columns=model_features)
    predicted_magnitude = model.predict(prediction_df)[0]

    if predicted_magnitude > 6.0:
        risk_level, risk_color = "উচ্চ ঝুঁকি", "red"
    elif predicted_magnitude > 5.0:
        risk_level, risk_color = "মাঝারি ঝুঁকি", "orange"
    else:
        risk_level, risk_color = "কম ঝুঁকি", "yellow"

    return {
        "country": country,
        "prediction": f"আগামী ৭ দিনে সম্ভাব্য সর্বোচ্চ মাত্রা: {predicted_magnitude:.1f}",
        "predicted_area": most_active_region,
        "center_lat": float(center_lat),
        "center_lon": float(center_lon),
        "risk_level": risk_level,
        "risk_color": risk_color,
        "recent_activity": f"গত ৯০ দিনে {num_quakes}টি ভূমিকম্প রেকর্ড হয়েছে",
        "avg_magnitude": round(avg_mag, 1),
        "max_magnitude": round(max_mag, 1),
        "disclaimer": "এটি শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে। সত্যিকারের পূর্বাভাস নয়।",
        "data_points_used": num_quakes
    }


@app.get("/api/news")
def get_earthquake_news():
    try:
        news_url = "https://news.google.com/rss/search?q=asia+earthquake&hl=en&gl=US&ceid=US:en"
        feed = feedparser.parse(news_url)
        news_items = []
        for entry in feed.entries[:8]:
            news_items.append({
                "title": entry.title,
                "link": entry.link,
                "published": entry.published
            })
        return {"news": news_items}
    except Exception as e:
        print(f"Error fetching news: {e}")
        return {"error": "এই মুহূর্তে সংবাদ আনা সম্ভব হচ্ছে না।"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
