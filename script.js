const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const prayerResult = document.getElementById('prayerResult');

searchBtn.addEventListener('click', () => {
    const cityName = cityInput.value.trim();
    if (cityName === '') {
        alert('Harap masukkan nama kota terlebih dahulu!');
        return;
    }
    getWeatherData(cityName);
    getPrayerTimes(cityName);
});

// Fitur tambahan: bisa tekan Enter langsung di kotak pencarian
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// 1. Fungsi Mengambil Data Cuaca & Ikon Status
async function getWeatherData(city) {
    try {
        weatherResult.innerHTML = `<p>Memuat data cuaca...</p>`;
        
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            weatherResult.innerHTML = `<p style="color: red;">Kota tidak ditemukan.</p>`;
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();

        if (!weatherData.current_weather) {
            weatherResult.innerHTML = `<p style="color: red;">Data cuaca tidak tersedia.</p>`;
            return;
        }

        const temp = weatherData.current_weather.temperature;
        const windspeed = weatherData.current_weather.windspeed;
        const weatherCode = weatherData.current_weather.weathercode;

        let weatherIcon = "☀️";
        let weatherDesc = "Cerah / Normal";

        if (weatherCode >= 1 && weatherCode <= 3) {
            weatherIcon = "⛅";
            weatherDesc = "Berawan / Mendung";
        } else if (weatherCode >= 45 && weatherCode <= 48) {
            weatherIcon = "🌫️";
            weatherDesc = "Berkabut";
        } else if (weatherCode >= 51 && weatherCode <= 67) {
            weatherIcon = "🌧️";
            weatherDesc = "Hujan";
        } else if (weatherCode >= 71 && weatherCode <= 77) {
            weatherIcon = "❄️";
            weatherDesc = "Salju";
        } else if (weatherCode >= 80 && weatherCode <= 99) {
            weatherIcon = "⛈️";
            weatherDesc = "Hujan Badai";
        }

        weatherResult.innerHTML = `
            <p><strong>Lokasi:</strong> ${name}, ${country || 'Indonesia'}</p>
            <p><strong>Suhu:</strong> ${temp} °C</p>
            <p><strong>Kecepatan Angin:</strong> ${windspeed} km/j</p>
            
            <div class="weather-status">
                <div class="weather-icon">${weatherIcon}</div>
                <div class="weather-desc">${weatherDesc}</div>
            </div>
        `;
    } catch (error) {
        console.error("Detail Error Cuaca:", error);
        weatherResult.innerHTML = `<p style="color: red;">Gagal memuat data cuaca.</p>`;
    }
}

// 2. Fungsi Mengambil Data Jadwal Sholat
async function getPrayerTimes(city) {
    try {
        prayerResult.innerHTML = `<p>Memuat jadwal sholat...</p>`;
        
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Indonesia&method=2`);
        const data = await res.json();

        if (data.code !== 200 || !data.data) {
            prayerResult.innerHTML = `<p style="color: red;">Jadwal sholat tidak ditemukan.</p>`;
            return;
        }

        const timings = data.data.timings;

        prayerResult.innerHTML = `
            <p><strong>Subuh:</strong> ${timings.Fajr}</p>
            <p><strong>Dzuhur:</strong> ${timings.Dhuhr}</p>
            <p><strong>Ashar:</strong> ${timings.Asr}</p>
            <p><strong>Maghrib:</strong> ${timings.Maghrib}</p>
            <p><strong>Isya:</strong> ${timings.Isha}</p>
        `;
    } catch (error) {
        console.error("Detail Error Sholat:", error);
        prayerResult.innerHTML = `<p style="color: red;">Gagal memuat jadwal sholat.</p>`;
    }
}