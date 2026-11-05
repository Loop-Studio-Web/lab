// SkyTracker: previsioni MET Norway (locationforecast 2.0) + ricerca città con Nominatim (OpenStreetMap).
// Tutto dal browser, nessun Worker. Regole dei servizi: coordinate a 4 decimali, cache fino a Expires,
// Nominatim solo all'invio (niente autocomplete), massimo 1 richiesta al secondo, cache dell'ultima ricerca.
const MET_URL = "https://api.met.no/weatherapi/locationforecast/2.0/complete";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_PLACE = { name: "Milano", country: "Italia", lat: 45.4642, lon: 9.19 };
const MET_FALLBACK_TTL = 15 * 60 * 1000;
const NOMINATIM_MIN_GAP = 1100;

const inputSearch = document.querySelector(".input-search");
const btnSearch = document.querySelector(".btn-search");
const errorMessage = document.querySelector(".error-message");
const weatherCard = document.querySelector(".weather-card");

let lastNominatim = 0;

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function setLoading(isLoading) {
  weatherCard.style.opacity = isLoading ? "0.6" : "1";
  btnSearch.disabled = isLoading;
}

const round4 = (n) => Math.round(n * 1e4) / 1e4;

function cacheGet(key) {
  try {
    const item = JSON.parse(sessionStorage.getItem(key));
    return item && item.until > Date.now() ? item.data : null;
  } catch {
    return null;
  }
}

function cacheSet(key, data, until) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, until }));
  } catch {
    /* storage pieno o bloccato: si va avanti senza cache */
  }
}

/* ---------- Nominatim: una città dal nome (solo all'invio) ---------- */

async function geocode(query) {
  const key = "sky:geo:" + query.toLowerCase();
  const cached = cacheGet(key);
  if (cached) return cached;

  const wait = lastNominatim + NOMINATIM_MIN_GAP - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastNominatim = Date.now();

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    addressdetails: "1",
    "accept-language": "it",
  });
  const response = await fetch(`${NOMINATIM_URL}?${params}`);
  if (!response.ok) throw new Error(`Nominatim ${response.status}`);
  const results = await response.json();
  if (!results.length) return null;

  const r = results[0];
  const a = r.address || {};
  const place = {
    name: a.city || a.town || a.village || a.municipality || a.county || r.name || query,
    country: a.country || "",
    lat: round4(parseFloat(r.lat)),
    lon: round4(parseFloat(r.lon)),
  };
  cacheSet(key, place, Date.now() + 24 * 3600 * 1000);
  return place;
}

/* ---------- MET Norway: la serie oraria ---------- */

async function fetchForecast(place) {
  const key = `sky:met:${place.lat},${place.lon}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const response = await fetch(`${MET_URL}?lat=${place.lat}&lon=${place.lon}`);
  if (!response.ok) throw new Error(`MET ${response.status}`);
  const data = await response.json();

  // Expires è leggibile solo se il server lo espone via CORS; altrimenti un tempo fisso.
  const expires = Date.parse(response.headers.get("Expires") || "");
  const until = expires > Date.now() ? expires : Date.now() + MET_FALLBACK_TTL;
  cacheSet(key, data, until);
  return data;
}

/* ---------- Simboli MET -> icone in weather/ + testo italiano ---------- */

const SYMBOLS = {
  clearsky: [113, "Sereno"],
  fair: [116, "Poco nuvoloso"],
  partlycloudy: [119, "Parzialmente nuvoloso"],
  cloudy: [122, "Coperto"],
  fog: [248, "Nebbia"],
  lightrain: [296, "Pioggia debole"],
  rain: [302, "Pioggia"],
  heavyrain: [308, "Pioggia forte"],
  lightrainshowers: [353, "Rovesci deboli"],
  rainshowers: [356, "Rovesci"],
  heavyrainshowers: [359, "Rovesci intensi"],
  lightsleet: [317, "Nevischio debole"],
  sleet: [320, "Nevischio"],
  heavysleet: [320, "Nevischio forte"],
  lightsleetshowers: [362, "Rovesci di nevischio"],
  sleetshowers: [365, "Rovesci di nevischio"],
  heavysleetshowers: [365, "Rovesci di nevischio forti"],
  lightsnow: [326, "Neve debole"],
  snow: [332, "Neve"],
  heavysnow: [338, "Neve forte"],
  lightsnowshowers: [368, "Rovesci di neve"],
  snowshowers: [371, "Rovesci di neve"],
  heavysnowshowers: [371, "Rovesci di neve forti"],
};

function describeSymbol(code) {
  const isDay = !/_night$/.test(code || "");
  const base = (code || "").replace(/_(day|night|polartwilight)$/, "");
  const plain = base.replace("andthunder", "");
  if (base.includes("andthunder")) {
    const icon = plain.includes("snow") ? 395 : plain.startsWith("light") ? 386 : 389;
    return { icon, text: "Temporale", isDay };
  }
  const entry = SYMBOLS[plain];
  return entry ? { icon: entry[0], text: entry[1], isDay } : { icon: null, text: "—", isDay };
}

function iconUrl({ icon, isDay }) {
  return icon ? `weather/64x64/${isDay ? "day" : "night"}/${icon}.png` : "img/default.svg";
}

/* ---------- Dalla serie oraria ai giorni ---------- */

// MET dà l'orario in UTC e nessun fuso: lo stimo dalla longitudine (15° = 1 h). Basta a decidere
// a che giorno appartiene un'ora; in estate può sbagliare di un'ora (esempio dimostrativo).
const offsetHours = (lon) => Math.round(lon / 15);

function localParts(iso, offset) {
  const d = new Date(Date.parse(iso) + offset * 3600 * 1000);
  return { date: d.toISOString().slice(0, 10), hour: d.getUTCHours() };
}

function buildModel(place, data) {
  const offset = offsetHours(place.lon);
  const series = data.properties.timeseries;
  const first = series[0];
  const now = first.data.instant.details;
  const nowSymbol = (first.data.next_1_hours || first.data.next_6_hours || {}).summary?.symbol_code;

  // pioggia nelle prossime 24 h: ore singole, poi blocchi da 6 h
  let rain = 0;
  let covered = 0;
  for (const e of series) {
    if (covered >= 24) break;
    const h1 = e.data.next_1_hours;
    const h6 = e.data.next_6_hours;
    if (h1) {
      rain += h1.details.precipitation_amount ?? 0;
      covered += 1;
    } else if (h6) {
      rain += h6.details.precipitation_amount ?? 0;
      covered += 6;
    }
  }

  const days = new Map();
  for (const e of series) {
    const { date, hour } = localParts(e.time, offset);
    const day = days.get(date) || { date, min: Infinity, max: -Infinity, best: null };
    const t = e.data.instant.details.air_temperature;
    day.min = Math.min(day.min, t);
    day.max = Math.max(day.max, t);
    const b6 = e.data.next_6_hours;
    if (b6) {
      day.max = Math.max(day.max, b6.details.air_temperature_max ?? t);
      day.min = Math.min(day.min, b6.details.air_temperature_min ?? t);
    }
    const code = (b6 || e.data.next_1_hours)?.summary?.symbol_code;
    if (code) {
      const dist = Math.abs(hour - 12);
      if (!day.best || dist < day.best.dist) day.best = { dist, code };
    }
    days.set(date, day);
  }

  const list = [...days.values()];
  return {
    place,
    now: {
      temp: now.air_temperature,
      feels: now.apparent_air_temperature ?? now.air_temperature,
      humidity: now.relative_humidity,
      wind: (now.wind_speed ?? 0) * 3.6,
      rain,
      symbol: describeSymbol(nowSymbol),
      localDate: list[0].date,
    },
    next: list.slice(1, 3),
  };
}

/* ---------- Disegno ---------- */

const fmtDay = (iso, opts) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("it-IT", { timeZone: "UTC", ...opts });

function setIcon(container, symbol) {
  const img = document.createElement("img");
  img.src = iconUrl(symbol);
  img.alt = symbol.text;
  container.replaceChildren(img);
}

function render(model) {
  const { place, now, next } = model;
  const text = (sel, value) => (document.querySelector(sel).textContent = value);

  text(".weather-info__city", place.country ? `${place.name}, ${place.country}` : place.name);
  text(".weather-info__description", now.symbol.text);
  text(".weather-info__day", fmtDay(now.localDate, { weekday: "long" }));
  text(".weather-info__date", fmtDay(now.localDate, {}));
  text(".weather-info__temperature", `${Math.round(now.temp)}°C`);
  text(".weather-info__units-c", `${Math.round(now.temp)}°C`);
  text(".weather-info__units-f", `${Math.round(now.temp * 1.8 + 32)}°F`);
  setIcon(document.querySelector(".weather-info__icon"), now.symbol);

  const details = document.querySelector(".weather-details");
  details.querySelector(".feels-like div span").textContent = `${Math.round(now.feels)}°C`;
  details.querySelector(".humidity div span").textContent = `${Math.round(now.humidity)}%`;
  details.querySelector(".rain div span").textContent = `${now.rain.toFixed(1).replace(".", ",")} mm`;
  details.querySelector(".wind div span").textContent = `${Math.round(now.wind)} km/h`;

  next.forEach((day, i) => {
    const card = document.querySelector(`.next-days-info-day${i + 1}`);
    const symbol = describeSymbol((day.best ? day.best.code : "").replace(/_night$/, "_day"));
    card.querySelector(".day").textContent = fmtDay(day.date, { weekday: "long" });
    card.querySelector(".max-temp").textContent = `Max ${Math.round(day.max)}°C`;
    card.querySelector(".min-temp").textContent = `Min ${Math.round(day.min)}°C`;
    setIcon(card.querySelector(".icon-next-day"), symbol);
  });
}

async function load(place) {
  clearError();
  setLoading(true);
  try {
    const data = await fetchForecast(place);
    render(buildModel(place, data));
    weatherCard.hidden = false;
    document.querySelector(".forecast").hidden = false;
  } catch (error) {
    console.error("SkyTracker:", error);
    showError("Servizio non disponibile al momento. Riprova tra poco.");
  } finally {
    setLoading(false);
  }
}

async function searchWeather() {
  const query = inputSearch.value.trim();
  if (!query) {
    showError("Inserisci il nome di una città.");
    return;
  }
  clearError();
  setLoading(true);
  try {
    const place = await geocode(query);
    if (!place) {
      showError("Città non trovata. Controlla il nome e riprova.");
      setLoading(false);
      return;
    }
    inputSearch.value = "";
    await load(place);
  } catch (error) {
    console.error("SkyTracker:", error);
    showError("Ricerca non disponibile al momento. Riprova tra poco.");
    setLoading(false);
  }
}

btnSearch.addEventListener("click", searchWeather);

inputSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchWeather();
  }
});

// Le card restano nascoste finché non arrivano i primi dati.
weatherCard.hidden = true;
document.querySelector(".forecast").hidden = true;
load(DEFAULT_PLACE);
