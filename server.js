const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const app = express();

// Токен твоего бота (замени на свой)
const TOKEN = '1234567890:AAF1w_PlojpJ8GCkTKIPvinNiGomB6gqQEo'; // Вставь токен от BotFather
const bot = new TelegramBot(TOKEN, { polling: true });

// Словарь дружелюбных ответов
const responses = {
    привет: ['Привет, братан, как дела?', 'Здарова, братишка, что нового?', 'Привет, брат, как ты?'],
    'как дела': ['Заебись, а у тебя?', 'Норм, братишка, а ты как?', 'Похер, всё ок, а у тебя?'],
    пока: ['Пока, братишка, не теряйся!', 'Давай, братан, до связи!', 'Похер, пока, держись!'],
    'что делаешь': ['Чиллю, а ты?', 'Похер, сижу, а ты что?', 'Ничего, братишка, а ты?'],
    'похер': ['Ну и пох, братишка, забей!', 'Похер, братан, не парься!', 'Похер, братишка, расслабься!'],
    'давай': ['Погнали, братишка!', 'Давай, братан, что дальше?', 'Го, братишка, я в деле!'],
    'спасибо': ['Похер, братишка, всегда рад!', 'Не за что, братан!', 'Да ладно, братишка, похер!'],
    'пох': ['Похер, братишка, расслабься!', 'Ну и пох, братан, не парься!', 'Похер, братишка, забей!'],
    'го': ['Го, братишка, куда?', 'Погнали, братан!', 'Давай, братишка, я в деле!'],
    'пиздец': ['Пиздец, братишка, что случилось?', 'Ого, братан, что за пиздец?', 'Похер, братишка, разберёмся!']
};

// Храним историю сообщений для каждого чата
const chatHistory = {};

// Функция для выбора случайного ответа
function getRandomResponse(options) {
    if (Array.isArray(options)) {
        return options[Math.floor(Math.random() * options.length)];
    }
    return options;
}

// Функция для поиска в интернете (простой запрос через Google Search API или парсинг)
async function searchOnline(query) {
    try {
        // Для настоящего поиска нужен Google Search API, но мы сделаем заглушку через публичный API
        const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
        const answer = response.data.AbstractText || response.data.RelatedTopics[0]?.Text || 'Братишка, я не нашёл инфу, давай попробуем ещё раз?';
        return `Вот что я нашёл, братан: ${answer}`;
    } catch (error) {
        console.error('Ошибка поиска в интернете:', error.message);
        return 'Похер, братишка, не смог найти инфу, давай попробуем ещё раз?';
    }
}

// Обработка входящих сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toLowerCase() : '';

    console.log(`Получено сообщение от ${msg.from.first_name}: ${text}`);

    // Сохраняем сообщение в историю
    if (!chatHistory[chatId]) {
        chatHistory[chatId] = [];
    }
    chatHistory[chatId].push(text);
    if (chatHistory[chatId].length > 5) {
        chatHistory[chatId].shift(); // Храним только последние 5 сообщений
    }

    let reply = 'Братишка, я не понял, что ты хочешь, напиши ещё раз!';

    // Проверяем контекст
    const lastMessage = chatHistory[chatId].length > 1 ? chatHistory[chatId][chatHistory[chatId].length - 2] : '';
    if (lastMessage.includes('как дела') && text.includes('хорошо')) {
        reply = 'Круто, братишка, рад за тебя!';
    } else if (lastMessage.includes('давай') && text.includes('го')) {
        reply = 'Похер, братишка, я в деле!';
    } else if (lastMessage.includes('что делаешь') && text.includes('ничего')) {
        reply = 'Похер, братишка, давай замутим что-нибудь!';
    } else {
        // Проверяем ключевые слова
        let found = false;
        for (const keyword in responses) {
            if (text.includes(keyword)) {
                reply = getRandomResponse(responses[keyword]);
                found = true;
                break;
            }
        }

        // Если не нашли ответ, ищем в интернете
        if (!found && text.length > 0) {
            reply = await searchOnline(text);
        }
    }

    // Отправляем ответ
    bot.sendMessage(chatId, reply)
        .then(() => console.log(`Отправлен ответ: ${reply}`))
        .catch((error) => console.error('Ошибка при отправке:', error.message));
});

// Для Render нужно запустить сервер
app.get('/', (req, res) => {
    res.send('Бот работает!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Пашет на порту ${port}`));