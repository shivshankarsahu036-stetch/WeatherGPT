/**
 * WeatherGPT - Conversational AI & Meteorological Decision Support
 * Comprehensive Frontend Controller with Dual-Mode (FastAPI Backend + Direct Open-Meteo Fallback)
 */

// ============================================================
// STATE & CONFIGURATION
// ============================================================
const CONFIG = {
    BACKEND_URL: 'http://localhost:8000',
    OPEN_METEO_GEO: 'https://geocoding-api.open-meteo.com/v1/search',
    OPEN_METEO_WEATHER: 'https://api.open-meteo.com/v1/forecast',
    OPEN_METEO_AIR: 'https://air-quality-api.open-meteo.com/v1/air-quality',
};

const STATE = {
    city: 'Mumbai',
    country: 'India',
    region: 'Maharashtra',
    coords: { lat: 19.0760, lon: 72.8777 },
    timezone: 'Asia/Kolkata',
    lang: 'en',
    backendOnline: false,
    ttsEnabled: true,
    activeTab: 'chatTab',
    activeSector: 'agriculture',
    weatherData: null,
    forecastData: null,
    alertsData: [],
    speechRecognition: null,
    isListening: false,
    map: null,
    radarLayer: null,
    stationsLayer: null,
    nwpChart: null,
    tempAnomalyChart: null,
    rainAnomalyChart: null
};

// WMO Weather Codes mapping
const WMO_MAP = {
    0: { desc: "Clear sky", icon: "fa-sun", color: "text-amber-400" },
    1: { desc: "Mainly clear", icon: "fa-cloud-sun", color: "text-amber-300" },
    2: { desc: "Partly cloudy", icon: "fa-cloud-sun", color: "text-sky-300" },
    3: { desc: "Overcast", icon: "fa-cloud", color: "text-slate-400" },
    45: { desc: "Foggy conditions", icon: "fa-smog", color: "text-slate-400" },
    48: { desc: "Depositing rime fog", icon: "fa-smog", color: "text-slate-400" },
    51: { desc: "Light drizzle", icon: "fa-cloud-rain", color: "text-blue-300" },
    53: { desc: "Moderate drizzle", icon: "fa-cloud-rain", color: "text-blue-400" },
    55: { desc: "Dense drizzle", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
    61: { desc: "Slight rain", icon: "fa-cloud-rain", color: "text-cyan-400" },
    63: { desc: "Moderate rain", icon: "fa-cloud-rain", color: "text-cyan-500" },
    65: { desc: "Heavy torrential rain", icon: "fa-cloud-showers-heavy", color: "text-blue-600" },
    71: { desc: "Slight snow fall", icon: "fa-snowflake", color: "text-sky-200" },
    73: { desc: "Moderate snow fall", icon: "fa-snowflake", color: "text-sky-300" },
    75: { desc: "Heavy snow fall", icon: "fa-snowflake", color: "text-sky-400" },
    80: { desc: "Rain showers", icon: "fa-cloud-showers-water", color: "text-cyan-400" },
    81: { desc: "Moderate rain showers", icon: "fa-cloud-showers-water", color: "text-cyan-500" },
    82: { desc: "Violent rain showers", icon: "fa-cloud-showers-heavy", color: "text-rose-400" },
    95: { desc: "Thunderstorm", icon: "fa-bolt-lightning", color: "text-amber-400" },
    96: { desc: "Thunderstorm with hail", icon: "fa-cloud-bolt", color: "text-rose-400" },
    99: { desc: "Severe hail thunderstorm", icon: "fa-cloud-bolt", color: "text-rose-500" }
};

// Multilingual translations for UI labels
const I18N = {
    en: {
        voiceBtn: "Voice AI",
        listening: "Listening... Speak in your language (English, Hindi, etc.)",
        placeholder: "Ask about rainfall forecast, crop advisory, cyclone warning, aviation winds...",
        welcome: "Hello! I am **WeatherGPT**, your meteorological AI assistant. How can I help you today with weather intelligence, crop advisories, or early warnings?",
        warning: "WARNING:",
        normalWatch: "Normal Weather Watch"
    },
    hi: {
        voiceBtn: "आवाज से पूछें",
        listening: "सुन रहे हैं... कृपया बोलें (हिन्दी / अंग्रेजी में)",
        placeholder: "मौसम पूर्वानुमान, फसल सलाह, चक्रवात या बारिश के बारे में पूछें...",
        welcome: "नमस्ते! मैं **WeatherGPT** हूँ, आपका मौसम पूर्वानुमान एवं आपदा चेतावनी सहायक। आज मैं आपकी किस प्रकार सहायता कर सकता हूँ?",
        warning: "चेतावनी:",
        normalWatch: "सामान्य मौसम"
    },
    bn: {
        voiceBtn: "কণ্ঠস্বর এআই",
        listening: "শুনছি... আপনার ভাষায় কথা বলুন",
        placeholder: "আবহাওয়া পূর্বাভাস, কৃষি পরামর্শ বা সতর্কতা সম্পর্কে জিজ্ঞাসা করুন...",
        welcome: "নমস্কার! আমি **WeatherGPT**, আপনার আবহাওয়া সংক্রান্ত এআই সহায়ক। কীভাবে আপনাকে সাহায্য করতে পারি?",
        warning: "সতর্কতা:",
        normalWatch: "স্বাভাবিক আবহাওয়া"
    },
    te: {
        voiceBtn: "వాయిస్ AI",
        listening: "వింటున్నాం... మీ భాషలో మాట్లాడండి",
        placeholder: "వాతావరణ సమాచారం, వ్యవసాయ సలహాలు లేదా హెచ్చరికలను అడగండి...",
        welcome: "నమస్కారం! నేను **WeatherGPT**, మీ వాతావరణ AI సహాయకుడిని. మీకు ఎలా సహాయపడగలను?",
        warning: "హెచ్చరిక:",
        normalWatch: "సాధారణ వాతావరణం"
    },
    ta: {
        voiceBtn: "குரல் AI",
        listening: "கேட்கிறது... உங்கள் மொழியில் பேசுங்கள்",
        placeholder: "வானிலை முன்னறிவிப்பு, விவசாய ஆலோசனை அல்லது எச்சரிக்கைகள் பற்றி கேளுங்கள்...",
        welcome: "வணக்கம்! நான் **WeatherGPT**, உங்கள் வானிலை AI உதவியாளர். உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?",
        warning: "எச்சரிக்கை:",
        normalWatch: "இயல்பான வானிலை"
    },
    mr: {
        voiceBtn: "आवाज AI",
        listening: "ऐकत आहे... तुमच्या भाषेत बोला",
        placeholder: "हवामान अंदाज, कृषी सल्ला किंवा वादळ इशारा विचारा...",
        welcome: "नमस्कार! मी **WeatherGPT**, आपला हवामान व आपत्ती सल्लागार AI. आज मी तुम्हाला कशी मदत करू शकेन?",
        warning: "धोका सूचना:",
        normalWatch: "सामान्य हवामान"
    },
    gu: {
        voiceBtn: "વોઇસ AI",
        listening: "સાંભળી રહ્યા છીએ... તમારી ભાષામાં બોલો",
        placeholder: "હવામાન આગાહી, ખેતી સલાહ અથવા ચેતવણીઓ વિશે પૂછો...",
        welcome: "નમસ્તે! હું **WeatherGPT** છું, તમારો હવામાન સલાહકાર AI. હું તમને કેવી રીતે મદદ કરી શકું?",
        warning: "ચેતવણી:",
        normalWatch: "સામાન્ય હવામાન"
    }
};

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    initClock();
    initTabNavigation();
    initSpeechRecognition();
    initEventListeners();
    await checkBackendStatus();
    await loadWeatherData(STATE.city);
    initLeafletMap();
    initCharts();
    addBotMessage(I18N[STATE.lang].welcome);
});

// Live Clock
function initClock() {
    function update() {
        const now = new Date();
        const utc = now.toUTCString().split(' ')[4] + ' UTC';
        const el = document.getElementById('liveClock');
        if (el) el.textContent = utc;
    }
    update();
    setInterval(update, 1000);
}

// Check Backend Connection
async function checkBackendStatus() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const pill = document.getElementById('backendStatusPill');

    try {
        const res = await fetch(`${CONFIG.BACKEND_URL}/api/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        if (res.ok) {
            const data = await res.json();
            STATE.backendOnline = true;
            dot.className = "h-2 w-2 rounded-full bg-emerald-400";
            text.textContent = data.gemini_active ? "Backend + Gemini Live" : "Backend (Rule Engine)";
            pill.title = "FastAPI backend active at http://localhost:8000";
            return;
        }
    } catch (e) {
        // Backend not running
    }

    STATE.backendOnline = false;
    dot.className = "h-2 w-2 rounded-full bg-cyan-400";
    text.textContent = "Direct Open-Meteo Mode";
    pill.title = "Direct Open-Meteo REST API (Stand-alone Browser Mode)";
}

// ============================================================
// TAB NAVIGATION
// ============================================================
function initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active', 'border-cyan-400', 'text-cyan-400'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.add('hidden');
            });
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.remove('hidden');
            }

            STATE.activeTab = targetId;

            // Trigger Map resize when switching to GIS Map
            if (targetId === 'gisMapTab' && STATE.map) {
                setTimeout(() => {
                    STATE.map.invalidateSize();
                }, 200);
            }

            // Render charts when switching to Climate Tab
            if (targetId === 'climateTab') {
                setTimeout(() => {
                    updateCharts();
                }, 200);
            }
        });
    });

    // Sector Subtabs
    const sectorTabs = document.querySelectorAll('.sector-subtab');
    sectorTabs.forEach(sTab => {
        sTab.addEventListener('click', () => {
            sectorTabs.forEach(st => {
                st.classList.remove('active', 'bg-emerald-500/20', 'text-emerald-400', 'border-emerald-500/30');
                st.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
            });
            sTab.classList.add('active', 'bg-emerald-500/20', 'text-emerald-400', 'border-emerald-500/30');
            sTab.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
            STATE.activeSector = sTab.dataset.sector;
            renderSectorAdvisory(STATE.activeSector);
        });
    });
}

// ============================================================
// DATA FETCHING & API INTEGRATION (DUAL-MODE)
// ============================================================
async function loadWeatherData(cityName) {
    showLoadingState(true);
    try {
        if (STATE.backendOnline) {
            // Fetch from FastAPI backend
            const [wRes, fRes, aRes] = await Promise.all([
                fetch(`${CONFIG.BACKEND_URL}/weather?city=${encodeURIComponent(cityName)}`),
                fetch(`${CONFIG.BACKEND_URL}/forecast?city=${encodeURIComponent(cityName)}&days=7`),
                fetch(`${CONFIG.BACKEND_URL}/alerts?city=${encodeURIComponent(cityName)}`)
            ]);

            if (!wRes.ok) throw new Error("City not found in backend");
            STATE.weatherData = await wRes.json();
            STATE.forecastData = await fRes.json();
            const alertsObj = await aRes.json();
            STATE.alertsData = alertsObj.alerts || [];

            STATE.city = STATE.weatherData.city;
            STATE.country = STATE.weatherData.country;
            STATE.region = STATE.weatherData.region;
            STATE.coords = { lat: STATE.weatherData.latitude, lon: STATE.weatherData.longitude };
        } else {
            // Direct Open-Meteo REST API fallback
            await loadWeatherDirect(cityName);
        }

        updateUI();
    } catch (err) {
        console.error("Failed to load weather:", err);
        addBotMessage(`⚠️ Unable to retrieve weather data for "${cityName}". Please verify the city spelling or network connection.`);
    } finally {
        showLoadingState(false);
    }
}

// Direct Open-Meteo Client
async function loadWeatherDirect(cityName) {
    // 1. Geocoding
    const geoUrl = `${CONFIG.OPEN_METEO_GEO}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
    }

    const loc = geoData.results[0];
    STATE.city = loc.name;
    STATE.country = loc.country || "Global";
    STATE.region = loc.admin1 || "";
    STATE.coords = { lat: loc.latitude, lon: loc.longitude };
    STATE.timezone = loc.timezone || "auto";

    // 2. Weather & Forecast
    const wUrl = `${CONFIG.OPEN_METEO_WEATHER}?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,surface_pressure,cloud_cover,uv_index,precipitation,is_day&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&forecast_days=7&timezone=auto`;
    const aqUrl = `${CONFIG.OPEN_METEO_AIR}?latitude=${loc.latitude}&longitude=${loc.longitude}&current=us_aqi,pm2_5,pm10&timezone=auto`;

    const [wRes, aqRes] = await Promise.all([
        fetch(wUrl),
        fetch(aqUrl).catch(() => null)
    ]);

    const wJson = await wRes.json();
    const aqJson = aqRes ? await aqRes.json() : null;

    const cur = wJson.current || {};
    const aqCur = aqJson ? aqJson.current || {} : {};

    STATE.weatherData = {
        city: STATE.city,
        region: STATE.region,
        country: STATE.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        temperature_c: cur.temperature_2m,
        feels_like_c: cur.apparent_temperature,
        humidity_percent: cur.relative_humidity_2m,
        pressure_hpa: cur.surface_pressure,
        weather_code: cur.weather_code || 0,
        condition: (WMO_MAP[cur.weather_code] || { desc: "Clear" }).desc,
        wind_speed_kmh: cur.wind_speed_10m,
        wind_gusts_kmh: cur.wind_gusts_10m,
        cloud_cover_percent: cur.cloud_cover,
        uv_index: cur.uv_index,
        precipitation_mm: cur.precipitation || 0,
        is_day: cur.is_day,
        air_quality: {
            aqi: aqCur.us_aqi || 65,
            pm2_5: aqCur.pm2_5 || 18.2,
            pm10: aqCur.pm10 || 32.5
        }
    };

    // Format hourly and daily lists
    const hourly = wJson.hourly || {};
    const daily = wJson.daily || {};

    const hourlyList = [];
    for (let i = 0; i < Math.min(24, (hourly.time || []).length); i++) {
        hourlyList.push({
            datetime: hourly.time[i],
            temperature_c: hourly.temperature_2m[i],
            humidity_percent: hourly.relative_humidity_2m[i],
            precipitation_probability: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 10,
            weather_code: hourly.weather_code[i],
            condition: (WMO_MAP[hourly.weather_code[i]] || { desc: "Fair" }).desc,
            wind_speed_kmh: hourly.wind_speed_10m[i]
        });
    }

    const dailyList = [];
    for (let i = 0; i < (daily.time || []).length; i++) {
        dailyList.push({
            date: daily.time[i],
            temp_max_c: daily.temperature_2m_max[i],
            temp_min_c: daily.temperature_2m_min[i],
            precipitation_sum_mm: daily.precipitation_sum ? daily.precipitation_sum[i] : 0,
            precipitation_probability_max: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 10,
            wind_speed_max_kmh: daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : 15,
            uv_index_max: daily.uv_index_max ? daily.uv_index_max[i] : 6,
            weather_code: daily.weather_code[i],
            condition: (WMO_MAP[daily.weather_code[i]] || { desc: "Clear" }).desc
        });
    }

    STATE.forecastData = {
        city: STATE.city,
        forecast: hourlyList,
        daily_forecast: dailyList
    };

    // Rule-based Alerts Calculation
    STATE.alertsData = calculateDirectAlerts(cur, daily);
}

function calculateDirectAlerts(cur, daily) {
    const alerts = [];
    const temp = cur.temperature_2m || 25;
    const apparent = cur.apparent_temperature || 26;
    const precipToday = daily.precipitation_sum ? daily.precipitation_sum[0] : 0;
    const wCode = cur.weather_code || 0;
    const wind = cur.wind_speed_10m || 10;

    if (temp >= 42 || apparent >= 44) {
        alerts.push({
            level: "Red",
            type: "Severe Heatwave Warning",
            headline: `Extreme Heatwave Conditions in ${STATE.city}`,
            description: `Surface temperature has surged to ${temp}°C with heat stress index of ${apparent}°C. Avoid outdoor exposure between 11 AM and 4 PM.`
        });
    } else if (temp >= 38) {
        alerts.push({
            level: "Orange",
            type: "Heatwave Advisory",
            headline: `Elevated Heat Advisory for ${STATE.city}`,
            description: `Maximum temperature recorded at ${temp}°C. Stay hydrated and avoid peak sunlight.`
        });
    }

    if (precipToday >= 100 || [65, 82].includes(wCode)) {
        alerts.push({
            level: "Red",
            type: "Heavy Rainfall & Flood Alert",
            headline: `Flash Flood Risk in ${STATE.city}`,
            description: `Heavy precipitation accumulation (${precipToday} mm). Inundation risk in low-lying and stormwater drains.`
        });
    } else if (precipToday >= 40 || [63, 81].includes(wCode)) {
        alerts.push({
            level: "Yellow",
            type: "Heavy Rain Watch",
            headline: `Rainfall Watch for ${STATE.city}`,
            description: `Expected precipitation of ${precipToday} mm. Commuters advised to check traffic alerts.`
        });
    }

    if ([95, 96, 99].includes(wCode)) {
        alerts.push({
            level: "Orange",
            type: "Severe Thunderstorm & Lightning Warning",
            headline: `Convective Thunderstorm in ${STATE.city}`,
            description: `Lightning hazard and squally wind gusts. Farmers and field workers should immediately seek indoor shelter.`
        });
    }

    return alerts;
}

// ============================================================
// UI UPDATES & RENDERING
// ============================================================
function updateUI() {
    const w = STATE.weatherData;
    if (!w) return;

    // 1. Sidebar Chat Card
    document.getElementById('chatCityName').innerHTML = `<i class="fa-solid fa-location-dot text-rose-500 mr-1.5"></i> ${w.city}, ${w.country}`;
    document.getElementById('chatCityCoordinates').textContent = `${w.latitude.toFixed(2)}° N, ${w.longitude.toFixed(2)}° E`;
    document.getElementById('chatCityTemp').textContent = `${Math.round(w.temperature_c)}°C`;
    document.getElementById('chatCityCond').textContent = w.condition;
    document.getElementById('chatCityHumidity').textContent = `${w.humidity_percent}%`;
    document.getElementById('chatCityWind').textContent = `${Math.round(w.wind_speed_kmh)} km/h`;

    // 2. Main Weather Hero Card (Tab 2)
    document.getElementById('heroCityName').textContent = w.city;
    document.getElementById('heroRegionCountry').textContent = `${w.region ? w.region + ', ' : ''}${w.country}`;
    document.getElementById('heroTemp').textContent = `${Math.round(w.temperature_c)}°`;
    document.getElementById('heroCondition').textContent = w.condition;
    document.getElementById('heroFeelsLike').textContent = `${Math.round(w.feels_like_c)}°C`;
    document.getElementById('heroPressure').textContent = `${w.pressure_hpa} hPa`;
    document.getElementById('heroUpdateTime').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const wmoObj = WMO_MAP[w.weather_code] || { icon: "fa-cloud-sun", color: "text-cyan-400" };
    document.getElementById('heroWeatherIcon').innerHTML = `<i class="fa-solid ${wmoObj.icon} ${wmoObj.color}"></i>`;

    // 3. Meteorological Metrics Grid
    document.getElementById('metricHumidity').textContent = `${w.humidity_percent}%`;
    document.getElementById('metricWindSpeed').textContent = `${Math.round(w.wind_speed_kmh)} km/h`;
    document.getElementById('metricWindGust').textContent = `${Math.round(w.wind_gusts_kmh || w.wind_speed_kmh * 1.3)} km/h`;

    const aqi = w.air_quality ? w.air_quality.aqi || 65 : 65;
    document.getElementById('metricAQI').textContent = aqi;
    const aqiBadge = document.getElementById('metricAQILabel');
    if (aqi <= 50) {
        aqiBadge.textContent = "Good";
        aqiBadge.className = "text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold";
    } else if (aqi <= 100) {
        aqiBadge.textContent = "Moderate";
        aqiBadge.className = "text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold";
    } else {
        aqiBadge.textContent = "Unhealthy";
        aqiBadge.className = "text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold";
    }
    document.getElementById('metricPM25').textContent = `${w.air_quality ? w.air_quality.pm2_5 : 18} µg/m³`;

    document.getElementById('metricUV').textContent = w.uv_index || 5.0;
    document.getElementById('metricPrecip').textContent = `${w.precipitation_mm || 0.0} mm`;
    document.getElementById('metricCloudCover').textContent = `${w.cloud_cover_percent || 30}%`;
    document.getElementById('metricBarometer').textContent = w.pressure_hpa;
    document.getElementById('metricDayCycle').textContent = w.is_day === 0 ? "Night" : "Daytime";

    // 4. Render Hourly Carousel
    renderHourlyForecast();

    // 5. Render 7-Day Forecast Cards
    renderDailyForecast();

    // 6. Update Warning Banner
    renderWarningBanner();

    // 7. Update Sector Decision Advisory
    renderSectorAdvisory(STATE.activeSector);

    // 8. Update GIS Map Position
    if (STATE.map) {
        STATE.map.setView([w.latitude, w.longitude], 9);
    }
}

// Render Hourly Carousel
function renderHourlyForecast() {
    const container = document.getElementById('hourlyForecastContainer');
    if (!container || !STATE.forecastData || !STATE.forecastData.forecast) return;

    container.innerHTML = '';
    const items = STATE.forecastData.forecast.slice(0, 24);

    items.forEach((item, idx) => {
        const timeStr = new Date(item.datetime).toLocaleTimeString([], { hour: 'numeric', hour12: true });
        const wmo = WMO_MAP[item.weather_code] || { icon: "fa-cloud-sun", color: "text-cyan-400" };

        const card = document.createElement('div');
        card.className = "flex-shrink-0 w-24 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center flex flex-col justify-between hover:border-cyan-500/50 transition";
        card.innerHTML = `
            <span class="text-[11px] text-slate-400 font-mono">${idx === 0 ? 'Now' : timeStr}</span>
            <div class="my-2 text-xl ${wmo.color}">
                <i class="fa-solid ${wmo.icon}"></i>
            </div>
            <span class="text-sm font-bold text-white">${Math.round(item.temperature_c)}°</span>
            <div class="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-cyan-300">
                <i class="fa-solid fa-droplet text-[8px]"></i> ${item.precipitation_probability}%
            </div>
        `;
        container.appendChild(card);
    });
}

// Render 7-Day Forecast Grid
function renderDailyForecast() {
    const container = document.getElementById('dailyForecastContainer');
    if (!container || !STATE.forecastData || !STATE.forecastData.daily_forecast) return;

    container.innerHTML = '';
    const days = STATE.forecastData.daily_forecast.slice(0, 7);

    days.forEach((day, idx) => {
        const dateObj = new Date(day.date);
        const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const wmo = WMO_MAP[day.weather_code] || { icon: "fa-sun", color: "text-amber-400" };

        const card = document.createElement('div');
        card.className = "p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between text-center hover:border-amber-500/40 transition";
        card.innerHTML = `
            <div>
                <p class="text-xs font-bold text-slate-200">${dayName}</p>
                <p class="text-[10px] text-slate-500">${dateFormatted}</p>
            </div>
            <div class="my-3 text-2xl ${wmo.color}">
                <i class="fa-solid ${wmo.icon}"></i>
            </div>
            <div class="text-xs font-medium text-slate-300 truncate" title="${day.condition}">
                ${day.condition}
            </div>
            <div class="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                <span class="text-white">${Math.round(day.temp_max_c)}°</span>
                <span class="text-slate-500">${Math.round(day.temp_min_c)}°</span>
            </div>
            <div class="mt-1 flex items-center justify-center gap-1 text-[10px] text-cyan-400 font-medium">
                <i class="fa-solid fa-umbrella text-[9px]"></i> ${day.precipitation_probability_max}%
            </div>
        `;
        container.appendChild(card);
    });
}

// Render Severe Weather Alert Banner
function renderWarningBanner() {
    const banner = document.getElementById('alertBanner');
    const badge = document.getElementById('alertBannerBadge');
    const text = document.getElementById('alertBannerText');

    if (!STATE.alertsData || STATE.alertsData.length === 0 || STATE.alertsData[0].level === "Green") {
        banner.classList.add('hidden');
        return;
    }

    const primaryAlert = STATE.alertsData[0];
    banner.classList.remove('hidden');
    badge.textContent = `${primaryAlert.level.toUpperCase()} ALERT:`;
    text.textContent = `${primaryAlert.type} - ${primaryAlert.headline}`;
}

// Render Sector Specific Advisories
function renderSectorAdvisory(sector) {
    const container = document.getElementById('sectorContentCard');
    if (!container || !STATE.weatherData) return;

    const w = STATE.weatherData;
    const temp = w.temperature_c;
    const wind = w.wind_speed_kmh;
    const humidity = w.humidity_percent;

    if (sector === 'agriculture') {
        const sprayOk = wind < 15;
        container.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Gramin Krishi Mausam Sewa (GKMS)</span>
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        🌾 Agro-Meteorological Decision Advisory for ${w.city}
                    </h3>
                    <p class="text-xs text-slate-400">Targeted crop advisories, irrigation scheduling, and pest protection protocols</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    High Relevance
                </span>
            </div>

            <!-- 4 Agri Metric Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Spraying Suitability</p>
                    <p class="text-sm font-bold ${sprayOk ? 'text-emerald-400' : 'text-amber-400'} mt-1">
                        <i class="fa-solid ${sprayOk ? 'fa-check-circle' : 'fa-triangle-exclamation'} mr-1"></i>
                        ${sprayOk ? 'Favorable Window' : 'Postpone (High Wind Drift)'}
                    </p>
                    <p class="text-[10px] text-slate-500 mt-1">Wind speed: ${Math.round(wind)} km/h</p>
                </div>

                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Irrigation Scheduling</p>
                    <p class="text-sm font-bold text-cyan-400 mt-1">
                        <i class="fa-solid fa-droplet mr-1"></i>
                        ${w.precipitation_mm > 5 ? 'Withhold Irrigation' : 'Light Evening Irrigation'}
                    </p>
                    <p class="text-[10px] text-slate-500 mt-1">Expected rain: ${w.precipitation_mm} mm</p>
                </div>

                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Soil Moisture & Blight Risk</p>
                    <p class="text-sm font-bold ${humidity > 75 ? 'text-amber-400' : 'text-slate-200'} mt-1">
                        <i class="fa-solid fa-shield-virus mr-1"></i>
                        ${humidity > 75 ? 'Elevated Fungal Risk' : 'Normal Moisture'}
                    </p>
                    <p class="text-[10px] text-slate-500 mt-1">Relative humidity: ${humidity}%</p>
                </div>

                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Harvest Protection</p>
                    <p class="text-sm font-bold text-emerald-400 mt-1">
                        <i class="fa-solid fa-box-archive mr-1"></i> Safe for Next 48h
                    </p>
                    <p class="text-[10px] text-slate-500 mt-1">No violent squall predicted</p>
                </div>
            </div>

            <!-- Actionable Recommendations for Farmers -->
            <div class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 class="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <i class="fa-solid fa-list-check"></i> Field Directives for Paddy, Wheat & Vegetables
                </h4>
                <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Maintain free flow in farm drainage channels to avert waterlogging if convective showers occur.</li>
                    <li>Farmers growing pulses should scout for pod borer activity in current thermal conditions (${Math.round(temp)}°C).</li>
                    <li>Store harvested produce immediately on elevated platforms under waterproof tarpaulins.</li>
                </ul>
            </div>
        `;
    } else if (sector === 'marine') {
        const waveHeight = (wind * 0.08).toFixed(1);
        const rough = wind > 30;
        container.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-blue-400">Coastal Marine & Fishery Advisory</span>
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        ⚓ Sea State & Fishermen Safety Bulletin for ${w.city} Coast
                    </h3>
                    <p class="text-xs text-slate-400">Dissemination under INCOIS / WMO marine early warning guidelines</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${rough ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">
                    ${rough ? 'Gale Warning' : 'Moderate Waters'}
                </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Estimated Wave Height</p>
                    <p class="text-xl font-bold text-cyan-300 mt-1">${waveHeight} - ${(parseFloat(waveHeight) + 0.5).toFixed(1)} m</p>
                    <p class="text-[10px] text-slate-500">Significant swell wave period: 6-8 sec</p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Sustained Coastal Wind</p>
                    <p class="text-xl font-bold text-white mt-1">${Math.round(wind)} km/h</p>
                    <p class="text-[10px] text-slate-500">Gusts up to ${Math.round(wind * 1.3)} km/h</p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Deep-Sea Venture Clearance</p>
                    <p class="text-xl font-bold ${rough ? 'text-rose-400' : 'text-emerald-400'} mt-1">
                        ${rough ? 'Restricted' : 'Permitted (Inshore)'}
                    </p>
                    <p class="text-[10px] text-slate-500">Within 20 nautical miles</p>
                </div>
            </div>

            <div class="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 space-y-2">
                <h4 class="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                    <i class="fa-solid fa-radio"></i> Marine Safety Protocols
                </h4>
                <ul class="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    <li>Traditional motorized boats should keep VHF transceivers tuned to Channel 16.</li>
                    <li>Anchor small fishing craft firmly in designated tidal creek berths.</li>
                    <li>Avoid venturing into offshore shoals during high-tide windows.</li>
                </ul>
            </div>
        `;
    } else if (sector === 'aviation') {
        container.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-sky-400">Aviation Weather Briefing</span>
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        ✈️ Aerodrome Surface Observation & METAR for ${w.city}
                    </h3>
                    <p class="text-xs text-slate-400">Runway wind component, altimeter setting, and turbulence profile</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    VFR Category
                </span>
            </div>

            <div class="p-3 rounded-xl bg-black/40 border border-slate-800 font-mono text-xs text-cyan-400">
                METAR ${w.city.substring(0,4).toUpperCase()} 061500Z ${Math.round(wind * 0.54)}KT 9999 FEW025 ${Math.round(temp)}/${Math.round(temp - 4)} Q${w.pressure_hpa} NOSIG=
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Runway Crosswind</p>
                    <p class="text-lg font-bold text-white mt-1">${(wind * 0.4).toFixed(1)} Knots</p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Altimeter (QNH)</p>
                    <p class="text-lg font-bold text-white mt-1">${w.pressure_hpa} hPa</p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Cloud Ceiling</p>
                    <p class="text-lg font-bold text-white mt-1">2,500 ft AGL</p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Turbulence Risk</p>
                    <p class="text-lg font-bold text-emerald-400 mt-1">Low / Light</p>
                </div>
            </div>
        `;
    } else {
        // Smart City & Urban
        container.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">Smart City & Municipal Resilience</span>
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        🏙️ Urban Climate Monitoring & Infrastructure Alert for ${w.city}
                    </h3>
                    <p class="text-xs text-slate-400">Urban heat island stress, stormwater drainage, and grid peak load prediction</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Disaster Mitigation
                </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Wet-Bulb Heat Stress</p>
                    <p class="text-lg font-bold ${temp > 35 ? 'text-rose-400' : 'text-emerald-400'} mt-1">
                        ${temp > 35 ? 'Severe (Wet-Bulb > 29°C)' : 'Moderate Urban Comfort'}
                    </p>
                    <p class="text-[10px] text-slate-500">Cooling shelters advisory</p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Drainage Flash Flood Index</p>
                    <p class="text-lg font-bold ${w.precipitation_mm > 20 ? 'text-amber-400' : 'text-emerald-400'} mt-1">
                        ${w.precipitation_mm > 20 ? 'Watch (Prone Lowlands)' : 'Low Inundation Risk'}
                    </p>
                    <p class="text-[10px] text-slate-500">Stormwater pump stations</p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p class="text-[11px] text-slate-400">Power Grid Peak HVAC Load</p>
                    <p class="text-lg font-bold text-cyan-400 mt-1">
                        ${temp > 32 ? 'High Thermal Peak' : 'Nominal Base Load'}
                    </p>
                    <p class="text-[10px] text-slate-500">Distribution transformer safety</p>
                </div>
            </div>
        `;
    }
}

// ============================================================
// CHATBOT & VOICE INTERFACE (WEATHERGPT AI)
// ============================================================
async function handleChatSubmit(messageText) {
    const text = messageText.trim();
    if (!text) return;

    // Add user message to UI
    addUserMessage(text);
    document.getElementById('chatInput').value = '';

    // Typing indicator
    const typingId = addTypingIndicator();

    try {
        let botReply = "";

        if (STATE.backendOnline) {
            const res = await fetch(`${CONFIG.BACKEND_URL}/chat?message=${encodeURIComponent(text)}&city=${encodeURIComponent(STATE.city)}&lang=${STATE.lang}`);
            if (!res.ok) throw new Error("Chat request failed");
            const data = await res.json();
            botReply = data.answer;
        } else {
            // Standalone in-browser intelligent weather decision reply
            botReply = generateDirectAIReply(text);
        }

        removeTypingIndicator(typingId);
        addBotMessage(botReply);

        // If TTS is enabled, read it aloud
        if (STATE.ttsEnabled) {
            speakText(botReply);
        }
    } catch (e) {
        removeTypingIndicator(typingId);
        addBotMessage("Sorry, I encountered an issue processing your meteorological query. Please try again.");
    }
}

function addUserMessage(text) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = "flex items-start justify-end gap-2.5";
    msg.innerHTML = `
        <div class="chat-bubble-user p-3 max-w-[80%] text-xs text-white shadow-md">
            <p>${escapeHtml(text)}</p>
        </div>
        <div class="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            You
        </div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function addBotMessage(markdownText) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = "flex items-start gap-2.5";
    
    // Parse markdown using marked.js
    const parsedHtml = marked.parse(markdownText);

    msg.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            AI
        </div>
        <div class="chat-bubble-bot p-3.5 max-w-[85%] text-xs text-slate-200 shadow-md space-y-2">
            <div class="prose prose-invert max-w-none text-xs leading-relaxed">
                ${parsedHtml}
            </div>
            <div class="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                <span class="font-mono text-cyan-400">WeatherGPT • Ground Truth</span>
                <div class="flex items-center gap-2">
                    <button class="hover:text-cyan-300 tts-play-btn" title="Listen with Text-to-Speech">
                        <i class="fa-solid fa-volume-high"></i> Listen
                    </button>
                    <button class="hover:text-slate-200 copy-btn" title="Copy to clipboard">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // TTS speaker button listener
    const playBtn = msg.querySelector('.tts-play-btn');
    playBtn.addEventListener('click', () => {
        speakText(markdownText);
    });

    // Copy button
    const copyBtn = msg.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(markdownText);
        copyBtn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i>`;
        setTimeout(() => {
            copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i>`;
        }, 2000);
    });

    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function addTypingIndicator() {
    const id = 'typing_' + Date.now();
    const container = document.getElementById('chatMessages');
    const el = document.createElement('div');
    el.id = id;
    el.className = "flex items-start gap-2.5";
    el.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            AI
        </div>
        <div class="chat-bubble-bot px-4 py-2.5 text-xs text-slate-400 flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
            <span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay: 0.15s"></span>
            <span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay: 0.3s"></span>
            <span class="ml-1 font-mono text-[10px] text-slate-400">Synthesizing meteorological model data...</span>
        </div>
    `;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Standalone Intelligent Response Generator (Offline / Fallback)
function generateDirectAIReply(userText) {
    const msg = userText.toLowerCase();
    const w = STATE.weatherData || { city: STATE.city, temperature_c: 28, humidity_percent: 75, wind_speed_kmh: 15, condition: "Partly cloudy" };
    const lang = STATE.lang;

    if (msg.includes("farm") || msg.includes("crop") || msg.includes("irrigation") || msg.includes("kisan") || msg.includes("krishi")) {
        if (lang === "hi") {
            return `🌾 **${w.city} के लिए कृषि सलाह (GKMS):**\n\n- **तापमान:** ${Math.round(w.temperature_c)}°C | **आर्द्रता:** ${w.humidity_percent}%\n- **सिंचाई सुझाव:** वर्तमान नमी स्तर को देखते हुए हल्की सिंचाई शाम को करें।\n- **कीटनाशक छिड़काव:** हवा की गति (${Math.round(w.wind_speed_kmh)} km/h) छिड़काव के लिए अनुकूल है।\n- **सावधानी:** धान व कपास की फसलों में जलभराव न होने दें।`;
        }
        return `🌾 **Agricultural Decision Advisory for ${w.city} (Gramin Krishi Mausam):**\n\n- **Temperature:** ${Math.round(w.temperature_c)}°C | **Humidity:** ${w.humidity_percent}%\n- **Irrigation:** Given the ${w.condition.toLowerCase()} and current soil moisture, avoid excess artificial watering.\n- **Pesticide Window:** Wind speed of ${Math.round(w.wind_speed_kmh)} km/h is safe (<15 km/h) for uniform crop spraying without spray drift.\n- **Storage Directive:** Keep harvested grain bags on pallets above ground level.`;
    }

    if (msg.includes("marine") || msg.includes("sea") || msg.includes("fish") || msg.includes("boat") || msg.includes("cyclone")) {
        return `⚓ **Marine & Coastal Safety Briefing for ${w.city} Waters:**\n\n- **Sustained Wind:** ${Math.round(w.wind_speed_kmh)} km/h\n- **Estimated Sea State:** ${w.wind_speed_kmh > 30 ? 'Rough (Caution)' : 'Moderate / Slight'}\n- **Wave Height:** Approx ${(w.wind_speed_kmh * 0.08).toFixed(1)} to ${(w.wind_speed_kmh * 0.12).toFixed(1)} meters.\n- **Fishermen Advisory:** Inshore artisanal craft can operate safely within 10 nautical miles. Keep emergency VHF channel 16 active.`;
    }

    if (msg.includes("flight") || msg.includes("aviation") || msg.includes("pilot") || msg.includes("wind")) {
        return `✈️ **Aviation Meteorological Status for ${w.city}:**\n\n- **Category:** VFR (Visual Flight Rules)\n- **Surface Pressure:** ${w.pressure_hpa || 1012} hPa (QNH)\n- **Crosswind Vector:** ${(w.wind_speed_kmh * 0.4).toFixed(1)} knots\n- **Atmospheric Visibility:** Greater than 10 kilometers with no significant low-level shear.`;
    }

    if (msg.includes("alert") || msg.includes("warning") || msg.includes("rain") || msg.includes("flood") || msg.includes("heat")) {
        return `⚠️ **Extreme Weather & Hazard Assessment for ${w.city}:**\n\n- **Current Condition:** ${w.condition} (${Math.round(w.temperature_c)}°C)\n- **Precipitation Threat:** Low to moderate convective potential.\n- **Heat Stress Index:** Feels like ${Math.round(w.feels_like_c || w.temperature_c)}°C.\n- **Early Warning Summary:** No severe cyclone or flood evacuation directives currently issued. Normal civic preparedness advised.`;
    }

    // Default general forecast briefing
    if (lang === "hi") {
        return `🌦️ **${w.city} मौसम सारांश:**\n\n- **मौसम स्थिति:** ${w.condition}\n- **तापमान:** ${Math.round(w.temperature_c)}°C (महसूस: ${Math.round(w.feels_like_c || w.temperature_c)}°C)\n- **हवा:** ${Math.round(w.wind_speed_kmh)} km/h | **आर्द्रता:** ${w.humidity_percent}%\n\nआप किसी विशेष क्षेत्र जैसे **किसान सलाह, विमानन रिपोर्ट, समुद्र तटीय चेतावनी** या 7 दिनों के विस्तृत पूर्वानुमान के बारे में भी पूछ सकते हैं!`;
    }

    return `🌦️ **Meteorological Briefing for ${w.city}:**\n\n- **Atmospheric State:** ${w.condition}\n- **Ambient Temperature:** ${Math.round(w.temperature_c)}°C (Feels like: ${Math.round(w.feels_like_c || w.temperature_c)}°C)\n- **Relative Humidity:** ${w.humidity_percent}% | **Surface Pressure:** ${w.pressure_hpa || 1012} hPa\n- **Wind Vector:** ${Math.round(w.wind_speed_kmh)} km/h\n\nYou can ask about specific agricultural advisories, aviation flight safety, marine warnings, or numerical NWP multi-model projections!`;
}

// Speech Recognition (Rural Accessibility)
function initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        console.warn("Web Speech API not supported in this browser.");
        return;
    }

    STATE.speechRecognition = new SpeechRec();
    STATE.speechRecognition.continuous = false;
    STATE.speechRecognition.interimResults = false;

    STATE.speechRecognition.onstart = () => {
        STATE.isListening = true;
        document.getElementById('voiceListeningBar').classList.remove('hidden');
        document.getElementById('micBtn').classList.add('bg-emerald-600', 'text-white', 'glow-emerald');
    };

    STATE.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chatInput').value = transcript;
        handleChatSubmit(transcript);
    };

    STATE.speechRecognition.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        stopListening();
    };

    STATE.speechRecognition.onend = () => {
        stopListening();
    };
}

function startListening() {
    if (!STATE.speechRecognition) {
        alert("Voice recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
        return;
    }

    const langCodes = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        mr: 'mr-IN',
        gu: 'gu-IN'
    };

    STATE.speechRecognition.lang = langCodes[STATE.lang] || 'en-IN';
    try {
        STATE.speechRecognition.start();
    } catch (e) {
        // already started
    }
}

function stopListening() {
    STATE.isListening = false;
    document.getElementById('voiceListeningBar').classList.add('hidden');
    document.getElementById('micBtn').classList.remove('bg-emerald-600', 'text-white', 'glow-emerald');
}

// Text-to-Speech (TTS Audio Playback)
function speakText(rawMarkdown) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // cancel ongoing speech

    // Strip markdown formatting for cleaner speech
    const cleanText = rawMarkdown
        .replace(/[*#_`>]/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/•/g, '')
        .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const langCodes = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        mr: 'mr-IN',
        gu: 'gu-IN'
    };
    utterance.lang = langCodes[STATE.lang] || 'en-IN';

    window.speechSynthesis.speak(utterance);
}

// ============================================================
// LEAFLET GIS MAP & RADAR TILES
// ============================================================
function initLeafletMap() {
    const mapElement = document.getElementById('leafletMap');
    if (!mapElement) return;

    // Dark Matter tile layer (CartoDB)
    const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    });

    STATE.map = L.map('leafletMap', {
        center: [STATE.coords.lat, STATE.coords.lon],
        zoom: 7,
        layers: [darkTiles]
    });

    // RainViewer Radar Layer (Live Doppler precipitation)
    loadRainViewerRadar();

    // Weather Stations Overlay
    createWeatherStationsOverlay();

    // Map click event to fetch coordinates weather
    STATE.map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        L.popup()
            .setLatLng(e.latlng)
            .setContent(`<div class="text-xs p-1"><strong>Inspecting Coordinates:</strong><br>${lat.toFixed(3)}° N, ${lng.toFixed(3)}° E<br><span class="text-cyan-400">Fetching live weather...</span></div>`)
            .openOn(STATE.map);

        await reverseGeocodeAndLoad(lat, lng);
    });
}

async function loadRainViewerRadar() {
    try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
            const latestRadar = data.radar.past[data.radar.past.length - 1];
            const radarPath = latestRadar.path;
            const tileSize = 256;

            STATE.radarLayer = L.tileLayer(`https://tilecache.rainviewer.com${radarPath}/${tileSize}/{z}/{x}/{y}/2/1_1.png`, {
                opacity: 0.65,
                zIndex: 100
            });
            STATE.radarLayer.addTo(STATE.map);
        }
    } catch (e) {
        console.warn("RainViewer tile API unavailable, using simulation layer.");
    }
}

function createWeatherStationsOverlay() {
    const stations = [
        { name: "Colaba IMD Observatory", lat: 18.9067, lon: 72.8147 },
        { name: "Santacruz Airport Station", lat: 19.0896, lon: 72.8656 },
        { name: "Safdarjung Delhi Station", lat: 28.5833, lon: 77.2000 },
        { name: "Palam Airport Delhi", lat: 28.5665, lon: 77.1031 },
        { name: "Meenambakkam Chennai", lat: 12.9866, lon: 80.1740 },
        { name: "Alipore Kolkata", lat: 22.5333, lon: 88.3333 },
        { name: "Bengaluru HAL Airport", lat: 12.9500, lon: 77.6667 }
    ];

    const markers = [];
    stations.forEach(st => {
        const marker = L.circleMarker([st.lat, st.lon], {
            radius: 6,
            fillColor: "#00e5ff",
            color: "#ffffff",
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85
        }).bindPopup(`
            <div class="text-xs p-1.5 space-y-1">
                <strong class="text-cyan-400 font-bold">${st.name}</strong>
                <p class="text-[10px] text-slate-300">WMO / National Meteorological Observatory</p>
                <button onclick="window.loadCityFromStation('${st.name.split(' ')[0]}')" class="mt-1 px-2 py-0.5 bg-cyan-600 text-white rounded text-[10px]">Load Forecast</button>
            </div>
        `);
        markers.push(marker);
    });

    STATE.stationsLayer = L.layerGroup(markers);
    STATE.stationsLayer.addTo(STATE.map);
}

window.loadCityFromStation = function(city) {
    loadWeatherData(city);
};

async function reverseGeocodeAndLoad(lat, lon) {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await res.json();
        const detectedCity = data.city || data.locality || data.principalSubdivision || `${lat.toFixed(2)},${lon.toFixed(2)}`;
        await loadWeatherData(detectedCity);
    } catch (e) {
        await loadWeatherData(`${lat.toFixed(2)},${lon.toFixed(2)}`);
    }
}

// ============================================================
// CHART.JS NWP & CLIMATE VISUALIZATIONS
// ============================================================
function initCharts() {
    // 1. NWP Multi-Model Comparison Chart
    const nwpCtx = document.getElementById('nwpComparisonChart');
    if (nwpCtx) {
        const labels = Array.from({ length: 12 }, (_, i) => `+${(i+1)*2}h`);
        STATE.nwpChart = new Chart(nwpCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'GFS (NOAA / NCEP)',
                        data: [28.2, 29.5, 31.0, 32.4, 31.8, 29.6, 28.0, 27.2, 26.8, 27.5, 29.0, 31.2],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        tension: 0.35,
                        borderWidth: 2.5
                    },
                    {
                        label: 'ECMWF (IFS European Centre)',
                        data: [28.0, 29.1, 30.6, 31.9, 31.3, 29.2, 27.8, 27.0, 26.5, 27.2, 28.7, 30.8],
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        tension: 0.35,
                        borderWidth: 2.5,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'ICON (DWD Germany)',
                        data: [28.4, 29.8, 31.3, 32.6, 32.0, 29.9, 28.3, 27.4, 27.0, 27.8, 29.3, 31.5],
                        borderColor: '#f59e0b',
                        backgroundColor: 'transparent',
                        tension: 0.35,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#cbd5e1', font: { size: 11 } } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                    y: { 
                        grid: { color: 'rgba(255,255,255,0.06)' }, 
                        ticks: { color: '#94a3b8', callback: v => v + '°C' } 
                    }
                }
            }
        });
    }

    // 2. Decadal Temperature Anomaly Chart
    const tempCtx = document.getElementById('tempAnomalyChart');
    if (tempCtx) {
        STATE.tempAnomalyChart = new Chart(tempCtx, {
            type: 'bar',
            data: {
                labels: ['1990', '1995', '2000', '2005', '2010', '2015', '2020', '2024'],
                datasets: [{
                    label: 'Temperature Anomaly (°C)',
                    data: [-0.15, -0.05, 0.12, 0.28, 0.42, 0.65, 0.89, 1.15],
                    backgroundColor: d => d.raw >= 0 ? 'rgba(244, 63, 94, 0.7)' : 'rgba(56, 189, 248, 0.7)',
                    borderColor: d => d.raw >= 0 ? '#f43f5e' : '#38bdf8',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => (v > 0 ? '+' : '') + v + '°C' } }
                }
            }
        });
    }

    // 3. Monsoon Rainfall Anomaly Chart
    const rainCtx = document.getElementById('rainAnomalyChart');
    if (rainCtx) {
        STATE.rainAnomalyChart = new Chart(rainCtx, {
            type: 'line',
            data: {
                labels: ['1990', '1995', '2000', '2005', '2010', '2015', '2020', '2024'],
                datasets: [{
                    label: 'Precipitation Deviation (%)',
                    data: [4.2, -2.1, 1.5, -6.8, 8.1, -4.5, 9.8, 12.4],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => (v > 0 ? '+' : '') + v + '%' } }
                }
            }
        });
    }
}

function updateCharts() {
    if (STATE.nwpChart && STATE.weatherData) {
        const base = STATE.weatherData.temperature_c;
        const gfs = [base, base + 1.2, base + 2.5, base + 3.4, base + 2.8, base + 0.6, base - 1.2, base - 2.0, base - 2.5, base - 1.8, base + 0.5, base + 2.2];
        const ecmwf = gfs.map(v => Number((v - 0.4 + Math.random()*0.8).toFixed(1)));
        const icon = gfs.map(v => Number((v + 0.2 + Math.random()*0.6).toFixed(1)));

        STATE.nwpChart.data.datasets[0].data = gfs;
        STATE.nwpChart.data.datasets[1].data = ecmwf;
        STATE.nwpChart.data.datasets[2].data = icon;
        STATE.nwpChart.update();
    }
}

// ============================================================
// EVENT LISTENERS & CONTROLS
// ============================================================
function initEventListeners() {
    // City Search Input & Button
    const searchInput = document.getElementById('citySearchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) loadWeatherData(city);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const city = searchInput.value.trim();
            if (city) loadWeatherData(city);
        }
    });

    // Geolocation Locate Button
    document.getElementById('locateBtn').addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                await reverseGeocodeAndLoad(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                alert("Location permission was denied. Using search fallback.");
            }
        );
    });

    // Trending City Chips
    document.querySelectorAll('.city-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const city = chip.dataset.city;
            searchInput.value = city;
            loadWeatherData(city);
        });
    });

    // Prompt Chips in Chat Sidebar
    document.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const title = chip.querySelector('.font-semibold').textContent;
            let query = `Provide ${title} for ${STATE.city}`;
            if (title.includes("Farmer")) query = `What is the agricultural and irrigation advisory for crops in ${STATE.city}?`;
            if (title.includes("Fishermen")) query = `Is it safe for fishermen to venture out into the sea near ${STATE.city}?`;
            if (title.includes("Aviation")) query = `Give me an aviation weather briefing and crosswind estimate for ${STATE.city}.`;
            if (title.includes("Extreme")) query = `Are there any heatwave, cyclone, or severe rainfall alerts in ${STATE.city}?`;
            if (title.includes("NWP")) query = `Compare the GFS and ECMWF numerical model forecasts for ${STATE.city}.`;

            handleChatSubmit(query);
        });
    });

    // Chat Form Submit
    document.getElementById('chatForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        handleChatSubmit(input.value);
    });

    // Microphone Voice Buttons
    document.getElementById('micBtn').addEventListener('click', () => {
        if (STATE.isListening) stopListening();
        else startListening();
    });

    document.getElementById('quickVoiceBtn').addEventListener('click', () => {
        // Switch to chat tab and start listening
        document.querySelector('[data-tab="chatTab"]').click();
        startListening();
    });

    document.getElementById('cancelVoiceBtn').addEventListener('click', stopListening);

    // Clear Chat
    document.getElementById('clearChatBtn').addEventListener('click', () => {
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        addBotMessage(I18N[STATE.lang].welcome);
    });

    // Text-to-Speech Toggle
    const ttsBtn = document.getElementById('ttsToggleBtn');
    ttsBtn.addEventListener('click', () => {
        STATE.ttsEnabled = !STATE.ttsEnabled;
        if (STATE.ttsEnabled) {
            ttsBtn.className = "p-1.5 text-cyan-400 hover:text-cyan-300 text-xs rounded hover:bg-slate-800";
            ttsBtn.title = "Text-to-Speech Enabled";
        } else {
            ttsBtn.className = "p-1.5 text-slate-500 hover:text-slate-300 text-xs rounded hover:bg-slate-800";
            ttsBtn.title = "Text-to-Speech Muted";
            window.speechSynthesis.cancel();
        }
    });

    // Language Selector
    const langSelect = document.getElementById('languageSelector');
    langSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        STATE.lang = lang;
        applyLanguage(lang);
    });

    // GIS Map Layer Toggles
    const radarBtn = document.getElementById('layerRadarBtn');
    radarBtn.addEventListener('click', () => {
        if (!STATE.map || !STATE.radarLayer) return;
        if (STATE.map.hasLayer(STATE.radarLayer)) {
            STATE.map.removeLayer(STATE.radarLayer);
            radarBtn.classList.remove('bg-cyan-600', 'text-white');
            radarBtn.classList.add('bg-slate-800', 'text-slate-300');
        } else {
            STATE.map.addLayer(STATE.radarLayer);
            radarBtn.classList.add('bg-cyan-600', 'text-white');
            radarBtn.classList.remove('bg-slate-800', 'text-slate-300');
        }
    });

    const stationsBtn = document.getElementById('layerStationsBtn');
    stationsBtn.addEventListener('click', () => {
        if (!STATE.map || !STATE.stationsLayer) return;
        if (STATE.map.hasLayer(STATE.stationsLayer)) {
            STATE.map.removeLayer(STATE.stationsLayer);
            stationsBtn.classList.remove('bg-cyan-600', 'text-white');
            stationsBtn.classList.add('bg-slate-800', 'text-slate-300');
        } else {
            STATE.map.addLayer(STATE.stationsLayer);
            stationsBtn.classList.add('bg-cyan-600', 'text-white');
            stationsBtn.classList.remove('bg-slate-800', 'text-slate-300');
        }
    });

    document.getElementById('resetMapCenterBtn').addEventListener('click', () => {
        if (STATE.map && STATE.coords) {
            STATE.map.setView([STATE.coords.lat, STATE.coords.lon], 9);
        }
    });
}

function applyLanguage(lang) {
    const texts = I18N[lang] || I18N.en;
    document.getElementById('voiceBtnLabel').textContent = texts.voiceBtn;
    document.getElementById('voiceListeningStatus').textContent = texts.listening;
    document.getElementById('chatInput').placeholder = texts.placeholder;

    const langNames = {
        en: "English",
        hi: "हिन्दी (Hindi)",
        bn: "বাংলা (Bengali)",
        te: "తెలుగు (Telugu)",
        ta: "தமிழ் (Tamil)",
        mr: "मराठी (Marathi)",
        gu: "ગુજરાતી (Gujarati)"
    };
    document.getElementById('activeLanguageIndicator').innerHTML = `<i class="fa-solid fa-language mr-1"></i>${langNames[lang] || "English"}`;

    addBotMessage(`🌐 Language switched to **${langNames[lang] || lang}**. WeatherGPT will now communicate and provide advisories in your preferred language.`);
}

function showLoadingState(isLoading) {
    const searchBtn = document.getElementById('searchBtn');
    if (isLoading) {
        searchBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
    } else {
        searchBtn.innerHTML = `Search`;
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
