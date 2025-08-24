 const apiKey = "a16d5af02d632e6888b926134f975957";
    const currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
    const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast/daily?units=metric&cnt=7&q=";

    const searchBox = document.getElementById("city-input");
    const searchBtn = document.getElementById("search-btn");
    const currentWeatherDiv = document.getElementById("current-weather");
    const chartContainer = document.querySelector(".chart-container");
    const weatherChartCtx = document.getElementById("weather-chart").getContext("2d");

    let weatherChart;

    function getDefaultLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
          },
          () => fetchWeather("Delhi")
        );
      } else {
        fetchWeather("Delhi");
      }
    }

    async function fetchWeatherByCoords(lat, lon) {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      const data = await response.json();
      fetchWeather(data.name);
    }

    async function fetchWeather(city) {
      try {
        const currentResponse = await fetch(currentWeatherUrl + city + `&appid=${apiKey}`);
        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(forecastUrl + city + `&appid=${apiKey}`);
        const forecastData = await forecastResponse.json();

        if (currentResponse.status === 404 || forecastResponse.status === 404) {
          currentWeatherDiv.innerHTML = `<p style="color:yellow;">City not found. Please try again.</p>`;
          chartContainer.style.display = "none";
          return;
        }

        displayCurrentWeather(currentData);
        displayForecastChart(forecastData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }

    function displayCurrentWeather(data) {
      const date = new Date(data.dt * 1000).toLocaleString();
      currentWeatherDiv.innerHTML = `
        <h2>📍 ${data.name}, ${data.sys.country}</h2>
        <p>📅 ${date}</p>
        <p>🌡 Temperature: <b>${data.main.temp}°C</b></p>
        <p>☁ Weather: ${data.weather[0].description}</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>💨 Wind Speed: ${data.wind.speed} m/s</p>
      `;
    }

    function displayForecastChart(data) {
      const labels = data.list.map((day) => new Date(day.dt * 1000).toLocaleDateString());
      const temperatures = data.list.map((day) => day.temp.day);
      const humidities = data.list.map((day) => day.humidity);

      if (weatherChart) weatherChart.destroy();

      weatherChart = new Chart(weatherChartCtx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temperatures,
              borderColor: "#ff7eb3",
              backgroundColor: "rgba(255,126,179,0.2)",
              fill: true,
              tension: 0.4
            },
            {
              label: "Humidity (%)",
              data: humidities,
              borderColor: "#74ebd5",
              backgroundColor: "rgba(116,235,213,0.2)",
              fill: true,
              tension: 0.4
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: "#e0e0e0" }
            }
          },
          scales: {
            x: { ticks: { color: "#e0e0e0" } },
            y: { ticks: { color: "#e0e0e0" } }
          }
        },
      });

      chartContainer.style.display = "block"; // Show chart after data loads
    }

    searchBtn.addEventListener("click", () => {
      const city = searchBox.value;
      if (city) fetchWeather(city);
      else alert("Please enter a city name.");
    });

    getDefaultLocation();


    