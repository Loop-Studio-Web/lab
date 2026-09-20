const WEATHER_PROXY_URL =
  "https://skytracker-weather-proxy.domenicociardullo85.workers.dev/weather";
const DEFAULT_CITY = "Milano";

const inputSearch = document.querySelector(".input-search");
const btnSearch = document.querySelector(".btn-search");
const errorMessage = document.querySelector(".error-message");
const weatherCard = document.querySelector(".weather-card");

function getDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", { weekday: "long" });
}

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

function searchWeather(city) {
  const query = (city ?? inputSearch.value).trim();
  if (!query) {
    showError("Inserisci il nome di una città.");
    return;
  }

  clearError();
  setLoading(true);

  const url = `${WEATHER_PROXY_URL}?q=${encodeURIComponent(query)}&days=3`;

  fetch(url, { mode: "cors" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        throw new Error(data.error.message || "Città non trovata.");
      }
      updateWeatherInfo(data);
      inputSearch.value = "";
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      showError("Città non trovata o servizio non disponibile. Riprova.");
    })
    .finally(() => setLoading(false));
}

btnSearch.addEventListener("click", () => searchWeather());

inputSearch.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    searchWeather();
  }
});

function updateWeatherInfo(data) {
  const location = data.location;
  const todayDayName = getDayName(data.location.localtime);

  document.querySelector(
    ".weather-info__city"
  ).innerText = `${location.name}, ${location.country}`;
  document.querySelector(".weather-info__description").innerText =
    data.current.condition.text;
  document.querySelector(".weather-info__day").innerText = todayDayName;
  document.querySelector(".weather-info__date").innerText = new Date(
    data.location.localtime
  ).toLocaleDateString("it-IT");
  document.querySelector(
    ".weather-info__temperature"
  ).innerText = `${Math.round(data.current.temp_c)}°C`;
  document.querySelector(
    ".weather-info__units-f"
  ).innerText = `${Math.round(data.current.temp_f)}°F`;
  document.querySelector(
    ".weather-info__units-c"
  ).innerText = `${Math.round(data.current.temp_c)}°C`;

  getWeatherIconUrl(data.current.condition.code, data.current.is_day).then(
    (iconUrl) => {
      const iconElement = document.querySelector(".weather-info__icon");
      iconElement.innerHTML = `<img src="${iconUrl}" alt="${data.current.condition.text}" />`;
    }
  );

  const weatherDetails = document.querySelector(".weather-details");
  weatherDetails.querySelector(
    ".feels-like div span"
  ).innerText = `${Math.round(data.current.feelslike_c)}°C`;
  weatherDetails.querySelector(
    ".humidity div span"
  ).innerText = `${data.current.humidity}%`;
  weatherDetails.querySelector(
    ".rain div span"
  ).innerText = `${data.forecast.forecastday[0].day.daily_chance_of_rain}%`;
  weatherDetails.querySelector(
    ".wind div span"
  ).innerText = `${Math.round(data.current.wind_kph)} km/h`;

  updateForecastDay(".next-days-info-day1", data.forecast.forecastday[1]);
  updateForecastDay(".next-days-info-day2", data.forecast.forecastday[2]);
}

function updateForecastDay(selector, forecastDay) {
  const card = document.querySelector(selector);
  const dayName = getDayName(forecastDay.date);

  card.querySelector(".day").innerText = dayName;
  card.querySelector(
    ".max-temp"
  ).innerText = `Max ${Math.round(forecastDay.day.maxtemp_c)}°C`;
  card.querySelector(
    ".min-temp"
  ).innerText = `Min ${Math.round(forecastDay.day.mintemp_c)}°C`;

  getWeatherIconUrl(forecastDay.day.condition.code, 1).then((iconUrl) => {
    card.querySelector(
      ".icon-next-day"
    ).innerHTML = `<img src="${iconUrl}" alt="${forecastDay.day.condition.text}" />`;
  });
}

function getWeatherIconUrl(conditionCode, isDay) {
  return fetch("weather/conditions.json")
    .then((response) => response.json())
    .then((conditions) => {
      const condition = conditions.find((item) => item.code === conditionCode);
      const icon = condition ? condition.icon : null;

      let iconUrl = "img/default.svg";
      if (icon) {
        const timeOfDay = isDay ? "day" : "night";
        iconUrl = `weather/64x64/${timeOfDay}/${icon}.png`;
      }

      return iconUrl;
    })
    .catch((error) => {
      console.error("Error fetching conditions:", error);
      return "img/default.svg";
    });
}

searchWeather(DEFAULT_CITY);
