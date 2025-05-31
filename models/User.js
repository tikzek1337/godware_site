const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: [true, 'Никнейм обязателен'],
        unique: true,
        trim: true,
        minlength: [3, 'Никнейм должен содержать минимум 3 символа'],
        maxlength: [20, 'Никнейм не должен превышать 20 символов']
    },
    username: {
        type: String,
        required: [true, 'Юзернейм обязателен'],
        unique: true,
        trim: true,
        minlength: [3, 'Юзернейм должен содержать минимум 3 символа'],
        maxlength: [20, 'Юзернейм не должен превышать 20 символов']
    },
    email: {
        type: String,
        required: [true, 'Email обязателен'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Пожалуйста, укажите корректный email']
    },
    password: {
        type: String,
        required: [true, 'Пароль обязателен'],
        minlength: [8, 'Пароль должен содержать минимум 8 символов'],
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Метод проверки пароля
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 