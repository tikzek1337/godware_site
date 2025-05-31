const { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } = require('firebase/auth');
const { doc, setDoc, getDoc } = require('firebase/firestore');
const { auth, db } = require('../config/firebase');

// Регистрация нового пользователя
exports.register = async (req, res) => {
    try {
        const { nickname, username, email, password } = req.body;

        // Создание пользователя в Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Отправка письма с подтверждением
        await sendEmailVerification(user);

        // Сохранение дополнительных данных пользователя в Firestore
        await setDoc(doc(db, 'users', user.uid), {
            nickname,
            username,
            email,
            emailVerified: false,
            createdAt: new Date().toISOString()
        });

        // Получение токена
        const token = await user.getIdToken();

        res.status(201).json({
            token,
            user: {
                uid: user.uid,
                nickname,
                username,
                email,
                emailVerified: false
            },
            message: 'Письмо с подтверждением отправлено на ваш email'
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// Вход пользователя
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Аутентификация пользователя
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Проверка подтверждения email
        if (!user.emailVerified) {
            return res.status(401).json({
                message: 'Пожалуйста, подтвердите ваш email перед входом'
            });
        }

        // Получение данных пользователя из Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        // Обновление статуса подтверждения email в Firestore
        if (!userData.emailVerified) {
            await setDoc(doc(db, 'users', user.uid), {
                ...userData,
                emailVerified: true
            }, { merge: true });
        }

        // Получение токена
        const token = await user.getIdToken();

        res.status(200).json({
            token,
            user: {
                uid: user.uid,
                ...userData,
                emailVerified: true
            }
        });
    } catch (error) {
        res.status(401).json({
            message: 'Неверный email или пароль'
        });
    }
};

// Сброс пароля
exports.resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Отправка письма для сброса пароля через Firebase
        await sendPasswordResetEmail(auth, email);

        res.status(200).json({
            message: 'Инструкции по сбросу пароля отправлены на ваш email'
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
}; 