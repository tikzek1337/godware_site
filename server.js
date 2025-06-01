const express = require('express');
const app = express();

app.use(express.static('.'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
}); 