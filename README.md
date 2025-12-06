# ভূমিকম্প কবে? (VumiKompo Kobe)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)

**A bilingual (Bengali/English) earthquake monitoring and prediction platform for Asia**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [API Documentation](#api-documentation) • [Screenshots](#screenshots)

</div>

---

> [!CAUTION]
> **⚠️ EXPERIMENTAL PROJECT - NOT FOR REAL-WORLD USE**
> 
> This is an experimental/educational project. **Earthquakes cannot be accurately predicted by current science.** The predictions shown in this application are based on simplified statistical models and historical data patterns. They should **never** be used for emergency planning, disaster preparedness, or any life-safety decisions. Always rely on official sources like USGS, local geological surveys, and government emergency services for earthquake information.

---

## 🌏 Overview

**ভূমিকম্প কবে?** (When is the Earthquake?) is a real-time earthquake monitoring and prediction application focused on the Asian region. It combines live USGS earthquake data with machine learning predictions to provide insights about seismic activity.

## ✨ Features

### 📍 Interactive Earthquake Map
- Real-time earthquake data visualization on an interactive Leaflet map
- Color-coded magnitude indicators (Blue → Yellow → Orange → Red)
- Location search with auto-complete suggestions
- Dark/Light theme support with corresponding map styles
- Click-to-zoom functionality for detailed exploration

### 🎯 Country-Specific Predictions
- Enter any country name to get earthquake predictions
- Risk level assessment (High/Medium/Low)
- Automatic map navigation to predicted areas
- Historical activity statistics (90-day analysis)

### 📰 Live News Feed
- Real-time earthquake news from Google News RSS
- Bengali-localized interface
- Click-through to original news sources

### 🔮 Asia-Wide Forecasting
- ML-based magnitude prediction for the next 7 days
- Most active region identification
- Data-driven insights from recent seismic activity

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 15 | React Framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| React-Leaflet | Interactive maps |
| Axios | HTTP client |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance API framework |
| scikit-learn | Machine learning predictions |
| Pandas/NumPy | Data processing |
| Joblib | Model serialization |
| Feedparser | RSS news parsing |

### External APIs
- **USGS Earthquake API** - Real-time earthquake data
- **Google News RSS** - Earthquake news aggregation
- **OpenStreetMap / Stadia Maps** - Map tile layers

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/VumiKompoKobe.git
cd VumiKompoKobe
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://127.0.0.1:8000
```

### Endpoints

#### Get Recent Earthquakes
```http
GET /api/earthquakes/recent?days=30&min_magnitude=4.0
```
Returns GeoJSON data of recent earthquakes in Asia.

#### Asia-Wide Prediction
```http
GET /api/predict
```
Returns 7-day earthquake magnitude prediction for Asia.

#### Country-Specific Prediction
```http
GET /api/predict/country?country=Japan
```
Returns earthquake predictions and risk level for a specific country.

**Response:**
```json
{
  "country": "Japan",
  "prediction": "আগামী ৭ দিনে সম্ভাব্য সর্বোচ্চ মাত্রা: 5.2",
  "predicted_area": "Honshu, Japan",
  "center_lat": 36.5,
  "center_lon": 138.2,
  "risk_level": "মাঝারি ঝুঁকি",
  "risk_color": "orange",
  "avg_magnitude": 4.3,
  "max_magnitude": 5.8,
  "data_points_used": 45
}
```

#### Get Earthquake News
```http
GET /api/news
```
Returns recent earthquake-related news articles.

### Interactive API Docs
Visit `http://127.0.0.1:8000/docs` for Swagger UI documentation.

## 🎨 Theme Support

The application supports both light and dark themes:

| Theme | Map Style | UI Style |
|-------|-----------|----------|
| Light | OpenStreetMap | White glassmorphism cards |
| Dark | Stadia Alidade Dark | Dark glassmorphism with blur |

Toggle the theme using the button in the sidebar footer.

## 📁 Project Structure

```
VumiKompoKobe/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── ml_model/
│       ├── asia_predictor.joblib
│       └── asia_model_features.joblib
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx   # Root layout with fonts
│   │   │   ├── page.tsx     # Main page component
│   │   │   └── globals.css  # Global styles
│   │   ├── components/
│   │   │   ├── EarthquakeMap.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PredictionAndRefs.tsx
│   │   │   ├── NewsFeed.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── context/
│   │       └── ThemeContext.tsx
│   ├── package.json
│   └── next.config.ts
│
└── README.md
```

## 🔧 Configuration

### Backend Configuration
Edit `backend/main.py` to modify:
- Geographic bounds (`MIN_LAT`, `MAX_LAT`, `MIN_LON`, `MAX_LON`)
- CORS origins
- API parameters

### Frontend Configuration
- API base URL in component files
- Map center and zoom level in `EarthquakeMap.tsx`
- Theme colors in `globals.css`

## ⚠️ Disclaimer

> **This application is for educational purposes only.** The earthquake predictions are based on simplified machine learning models and should not be used for actual disaster preparedness or emergency planning. Always refer to official sources like USGS, local geological surveys, and government emergency services for accurate earthquake information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
