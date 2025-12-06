import pandas as pd
import requests
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
import numpy as np
from datetime import datetime, timedelta
import time

min_lat, max_lat = -11.0, 81.0
min_lon, max_lon = 26.0, 180.0

start_date = datetime(1998, 1, 1)
end_date = datetime(2025, 11, 30)

print("Fetching a large historical dataset for Asia from USGS... This may take a while.")
url = f"https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime={start_date.isoformat()}&endtime={end_date.isoformat()}&minlatitude={min_lat}&maxlatitude={max_lat}&minlongitude={min_lon}&maxlongitude={max_lon}&minmagnitude=4.0&orderby=time-asc"

all_features = []
all_earthquakes = []
current_year = start_date.year
while current_year <= end_date.year:
    year_start = datetime(current_year, 1, 1)
    year_end = datetime(current_year, 12, 31)
    print(f"Fetching data for year: {current_year}")
    
    url_chunk = f"https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime={year_start.isoformat()}&endtime={year_end.isoformat()}&minlatitude={min_lat}&maxlatitude={max_lat}&minlongitude={min_lon}&maxlongitude={max_lon}&minmagnitude=4.0&orderby=time-asc"
    response = requests.get(url_chunk)
    data = response.json()
    all_earthquakes.extend(data['features'])
    time.sleep(1) 
    current_year += 1

print(f"Total earthquakes fetched: {len(all_earthquakes)}")

earthquakes = sorted(all_earthquakes, key=lambda x: x['properties']['time'])

for i in range(len(earthquakes)):
    current_quake_time = earthquakes[i]['properties']['time']
    past_window_start = current_quake_time - (30 * 24 * 60 * 60 * 1000)
    future_window_end = current_quake_time + (7 * 24 * 60 * 60 * 1000)
    
    past_quakes = [q for q in earthquakes if past_window_start <= q['properties']['time'] <= current_quake_time]
    future_quakes = [q for q in earthquakes if current_quake_time < q['properties']['time'] <= future_window_end]
    
    if len(past_quakes) < 10 or len(future_quakes) == 0:
        continue

    mags = [q['properties']['mag'] for q in past_quakes]
    num_quakes = len(mags)
    avg_mag = np.mean(mags)
    max_mag = np.max(mags)
    time_since_last = (current_quake_time - past_quakes[-1]['properties']['time']) / (1000 * 60 * 60)
    target_max_mag = np.max([q['properties']['mag'] for q in future_quakes])

    all_features.append([num_quakes, avg_mag, max_mag, time_since_last, target_max_mag])

print(f"Generated {len(all_features)} data samples for training.")
df = pd.DataFrame(all_features, columns=['num_quakes', 'avg_mag', 'max_mag', 'time_since_last', 'target_max_mag'])

X = df.drop('target_max_mag', axis=1)
y = df['target_max_mag']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training the new Asia-wide Gradient Boosting model...")
model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42)
model.fit(X_train, y_train)

mae = model.predict(X_test)
print(f"Model training complete. Mean Absolute Error on test set: {np.mean(np.abs(mae - y_test)):.2f}")

joblib.dump(model, 'ml_model/asia_predictor.joblib')
print("New Asia model saved to ml_model/asia_predictor.joblib")

joblib.dump(list(X.columns), 'ml_model/asia_model_features.joblib')
print("Asia model features saved to ml_model/asia_model_features.joblib")