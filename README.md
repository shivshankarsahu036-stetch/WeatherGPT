# 🌦️ WeatherGPT: Conversational AI for Weather Forecasting, Alerts & Climate Information

An enterprise-grade, multilingual conversational AI platform and meteorological decision-support system integrating real-time NWP forecasts, extreme weather early warnings, GIS radar layers, and sector-specific advisories for agriculture, marine, aviation, and disaster mitigation.

---

## 🌟 Key Features Implemented

1. **Real-Time Meteorological Ingestion**:
   - Live surface observations: Temperature, Apparent ("Feels Like") Temperature, Humidity, Barometric Pressure, Wind Speed/Direction/Gusts, UV Index, Cloud Cover, and Air Quality (AQI, PM2.5, PM10) via WMO & Open-Meteo.
2. **Conversational WeatherGPT AI Assistant**:
   - Context-aware natural language querying powered by **Google Gemini 2.5 Flash** with Open-Meteo ground-truth injection.
   - Dual-mode architecture: Runs seamlessly with FastAPI backend or offline/standalone in-browser fallback.
3. **Voice-Enabled Rural Accessibility**:
   - Web Speech API Speech-to-Text (STT) with audio pulse animation.
   - Multilingual Text-to-Speech (TTS) audio narration for farmers, rural citizens, and field operators.
4. **Extreme Weather Alerts & Early Warning Dissemination**:
   - Dynamic early warning system based on IMD / WMO severity criteria (Heatwave Watch, Very Heavy Rainfall & Flash Flood Warning, Convective Thunderstorm & Lightning Squall, Gale Wind Advisories).
   - High-visibility severity color banner (Red / Orange / Yellow).
5. **Interactive GIS Radar & Satellite Weather Map**:
   - Leaflet.js GIS interactive engine with Doppler radar precipitation overlays (RainViewer API), WMO surface observatory pins, and click-to-inspect coordinate weather.
6. **Sector-Specific Decision Support**:
   - 🌾 **Gramin Krishi Mausam (Agriculture)**: Irrigation scheduling, pesticide spraying weather window, soil moisture, and crop blight protection.
   - ⚓ **Coastal Marine & Fishermen Safety**: Sea state, significant wave height, swell period, gale warnings, and deep-sea venture clearance.
   - ✈️ **Aviation Weather Briefing**: METAR/TAF flight briefing, runway crosswind component, ceiling, and turbulence risk.
   - 🏙️ **Smart City & Disaster Management**: Urban heat island/wet-bulb stress, stormwater inundation risk, and HVAC peak grid load forecast.
7. **NWP Multi-Model Comparison & Climate Trends**:
   - Multi-model comparison across **GFS (NOAA)**, **ECMWF (Europe)**, and **ICON (Germany)**.
   - Decadal climate warming anomaly charts (1990–2024) and monsoon rainfall deviation trends.
8. **Indian Multilingual Support**:
   - English, हिन्दी (Hindi), বাংলা (Bengali), தமிழ் (Tamil), తెలుగు (Telugu), मराठी (Marathi), and ગુજરાતી (Gujarati).

---

## 📂 Project Architecture

```
weathergpt/
│
├── backend/
│   ├── main.py              # Enhanced FastAPI application with Gemini + Open-Meteo + Sector logic
│   ├── requirements.txt     # Python dependencies (fastapi, uvicorn, httpx, google-genai, etc.)
│   └── .env.example         # Gemini API key environment template
│
├── frontend/
│   ├── index.html           # Modern glassmorphism UI with 5 tabs, responsive design, audio controls
│   ├── style.css            # Tailwind & custom CSS, radar pulse animations, chat bubbles
│   └── app.js               # Core frontend controller, dual-mode API, Leaflet GIS, Chart.js, Web Speech
│
├── start.bat                # 1-Click Windows execution script
└── README.md                # Comprehensive documentation & presentation guide
```

---

## 🚀 How to Run

### Option 1: Quick 1-Click (Windows)
Double-click `start.bat`. It will:
1. Install Python dependencies (`pip install -r requirements.txt`).
2. Start the FastAPI server on `http://localhost:8000`.
3. Automatically launch your default browser.

### Option 2: Manual Terminal Execution
```bash
# 1. Navigate to backend
cd backend

# 2. (Optional) Set your Gemini API key
# PowerShell:
$env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
# Linux / macOS:
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# 3. Install requirements
pip install -r requirements.txt

# 4. Run the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Now visit **`http://localhost:8000`** in your browser.

### Option 3: Standalone Browser Mode (Zero Backend Setup Needed)
Simply open `frontend/index.html` directly in any web browser!
The application automatically detects that the backend is offline and switches to direct Open-Meteo REST API mode with local decision support intelligence.

---

## 🔌 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` or `/api/health` | GET | System health & Gemini client status |
| `/weather?city={city}` | GET | Current weather, air quality, wind gusts, UV index |
| `/forecast?city={city}&days=7`| GET | Hourly (48h) and 7-day daily forecast |
| `/alerts?city={city}` | GET | IMD/WMO Extreme weather early warnings & actions |
| `/advisories?city={city}&sector={sector}` | GET | Sector decision support (`agriculture`, `marine`, `aviation`, `urban`) |
| `/nwp?city={city}` | GET | GFS vs ECMWF vs ICON multi-model comparison |
| `/climate-trends?city={city}` | GET | Historical climate trends & temperature anomalies |
| `/chat?message={msg}&city={city}&lang={lang}` | GET | Gemini 2.5 Flash weather conversational assistant |

---

## 🏆 Hackathon Evaluation Alignment

- **Accuracy & Relevance**: Strict ground-truth meteorological data injection prevents LLM hallucination.
- **Response Latency**: Asynchronous non-blocking HTTP clients (`httpx`) with sub-second retrieval.
- **Multilingual Capability**: Native prompt conditioning across 7 major Indian languages.
- **Rural Accessibility**: Hands-free voice recognition and speech synthesis.
- **Scalability**: Stateless FastAPI microservice ready for Docker/Kubernetes containerization.
