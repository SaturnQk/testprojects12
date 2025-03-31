const express = require('express');
const axios = require('axios');
const app = express();

const TOKEN = '7962767337:AAG1w_PlojpJ8GCkTKIPvinNiGomB6gqQEo'; // Токен бота
const CHANNEL = '@vlomvlomdata'; // Название канала с @

app.use(express.json());
app.use(express.static('public'));

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

app.post('/collect', async (req, res) => {
    console.log('Запрос на /collect получен');
    const data = req.body;
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;
    console.log('Получены данные:', data);

    // Получаем страну по IP
    const { country, countryCode } = await getCountryByIp(ip);
    const flag = getFlagEmoji(countryCode);

    // Определяем устройство
    const device = parseDevice(data.userAgent);

    // Форматируем сообщение
    const text = `🔔 Новый посетитель!\n` +
        `🌍 Страна: ${country} ${flag}\n` +
        `🕒 Время: ${data.time}\n` +
        `📱 Устройство: ${device}\n` +
        `🌐 IP: ${ip}\n` +
        `🖥️ Разрешение экрана: ${data.screenResolution || 'Не предоставлено'}\n` +
        `🗣️ Язык: ${data.language || 'Не предоставлено'}\n` +
        `🔋 Батарея: ${data.battery || 'Не предоставлена'}`;

    try {
        const response = await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: CHANNEL,
            text: text
        });
        console.log('Сообщение отправлено в Telegram:', response.data);
        res.send('Ушло');
    } catch (error) {
        console.log('Пиздец, ошибка:', error.message);
        if (error.response) {
            console.log('Детали ошибки:', error.response.data);
        }
        res.send('Пиздец, ошибка');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Пашет на порту ${port}`));