const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

// Токен твоего нового бота
const TOKEN = '1234567890:AAF1w_PlojpJ8GCkTKIPvinNiGomB6gqQEo'; // Замени на токен от BotFather
const bot = new TelegramBot(TOKEN, { polling: true });

// Простая логика ответов на основе ключевых слов
const responses = {
    привет: 'Привет, братан, как дела?',
    'как дела': 'Заебись, а у тебя?',
    пока: 'Пока, братишка, не теряйся!',
    'что делаешь': 'Чиллю, а ты?',
    'похер': 'Ну и пох, братишка, забей!',
    'давай': 'Погнали, братишка!',
    'спасибо': 'Похер, братишка, всегда рад!',
    'пох': 'Похер, братишка, расслабься!'
};

// Обработка входящих сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toLowerCase() : '';

    console.log(`Получено сообщение от ${msg.from.first_name}: ${text}`);

    // Проверяем, есть ли текст в словаре ответов
    let reply = 'Братишка, я не понял, что ты хочешь, напиши ещё раз!';
    for (const keyword in responses) {
        if (text.includes(keyword)) {
            reply = responses[keyword];
            break;
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