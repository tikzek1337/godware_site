document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('authModal');
    const profileModal = document.getElementById('profileModal');
    const newsModal = document.getElementById('newsModal');
    const authBtn = document.getElementById('authBtn');
    const profileBtn = document.getElementById('profileBtn');
    const newsBtn = document.getElementById('newsBtn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const downloadBtn = document.querySelector('a[href="downloads/godware.exe"]');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    // Функция проверки авторизации
    function checkAuth() {
        const token = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (token && userData) {
            updateAuthUI(userData);
        }
    }

    // Функция проверки, авторизован ли пользователь
    function isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    // Функция выхода из системы
    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        updateAuthUI(null);
        showNotification('Вы вышли из системы', 'info');
    }

    // Функция обновления UI в зависимости от состояния авторизации
    function updateAuthUI(user) {
        if (user) {
            authBtn.textContent = 'Выйти';
            profileBtn.style.display = 'block';
            // Заполняем данные профиля
            document.getElementById('profileNickname').textContent = user.nickname || 'Не указан';
            document.getElementById('profileUsername').textContent = user.username || 'Не указан';
            
            // Обработка email
            const emailElement = document.getElementById('profileEmail');
            const toggleEmailBtn = document.getElementById('toggleEmailBtn');
            if (user.email) {
                const [username, domain] = user.email.split('@');
                const shortEmail = `${username.slice(0, 3)}...@${domain}`;
                emailElement.textContent = shortEmail;
                emailElement.dataset.fullEmail = user.email;
                toggleEmailBtn.style.display = 'inline-block';
            } else {
                emailElement.textContent = 'Не указан';
                toggleEmailBtn.style.display = 'none';
            }

            // Форматируем дату регистрации
            const registrationDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Не указана';
            document.getElementById('profileDate').textContent = registrationDate;
            
            // Обновляем статус с галочкой
            const statusElement = document.getElementById('profileStatus');
            if (user.emailVerified) {
                statusElement.textContent = 'Подтвержден';
                statusElement.className = 'status-with-icon verified';
            } else {
                statusElement.textContent = 'Не подтвержден';
                statusElement.className = 'status-with-icon not-verified';
            }
        } else {
            authBtn.textContent = 'Вход/Регистрация';
            profileBtn.style.display = 'none';
        }
    }

    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Проверка авторизации при загрузке
    checkAuth();

    // Открытие модального окна
    authBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (isAuthenticated()) {
            logout();
        } else {
            modal.style.display = 'block';
        }
    });

    // Обработчик для кнопки профиля
    profileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        profileModal.style.display = 'block';
    });

    // Обработчик для кнопки новостей
    newsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        newsModal.style.display = 'block';
    });

    // Закрытие модальных окон
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modal.style.display = 'none';
            profileModal.style.display = 'none';
            newsModal.style.display = 'none';
        });
    });

    // Закрытие модальных окон при клике вне их содержимого
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
        if (e.target === profileModal) {
            profileModal.style.display = 'none';
        }
        if (e.target === newsModal) {
            newsModal.style.display = 'none';
        }
    });

    // Переключение между вкладками
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === tabName + 'Form') {
                    form.classList.add('active');
                }
            });
        });
    });

    // Обработка формы входа
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем токен и данные пользователя
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // Обновляем UI
                updateAuthUI(data.user);
                modal.style.display = 'none';
                showNotification('Успешный вход!', 'success');
            } else {
                showNotification(data.message || 'Ошибка входа', 'error');
            }
        } catch (error) {
            showNotification('Ошибка сервера', 'error');
        }
    });

    // Обработка формы регистрации
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nickname = this.querySelector('input[placeholder="Никнейм"]').value;
        const username = this.querySelector('input[placeholder="Юзернейм"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nickname,
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем токен и данные пользователя
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // Обновляем UI
                updateAuthUI(data.user);
                modal.style.display = 'none';
                showNotification('Регистрация успешна!', 'success');
            } else {
                showNotification(data.message || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            showNotification('Ошибка сервера', 'error');
        }
        
        // Здесь будет логика регистрации
        console.log('Registration attempt:', { email, password });
        // TODO: Добавить реальную регистрацию через API
    });

    // Обработчик для кнопки скачивания
    downloadBtn.addEventListener('click', function(e) {
        if (!isAuthenticated()) {
            e.preventDefault();
            modal.style.display = 'block';
            showNotification('Для скачивания необходимо войти в аккаунт', 'info');
        }
    });

    // Обработчик для кнопки "Забыли пароль?"
    forgotPasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        authForms.forEach(form => form.classList.remove('active'));
        resetPasswordForm.classList.add('active');
        authTabs.forEach(tab => tab.classList.remove('active'));
    });

    // Обработчик для кнопки "Вернуться к входу"
    backToLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        authForms.forEach(form => form.classList.remove('active'));
        document.getElementById('loginForm').classList.add('active');
        authTabs.forEach(tab => {
            if (tab.dataset.tab === 'login') {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    });

    // Обработка формы сброса пароля
    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Инструкции по сбросу пароля отправлены на ваш email', 'success');
                // Возвращаемся к форме входа
                backToLoginBtn.click();
            } else {
                showNotification(data.message || 'Ошибка при сбросе пароля', 'error');
            }
        } catch (error) {
            showNotification('Ошибка сервера', 'error');
        }
    });

    // Обработчик для кнопки переключения отображения email
    document.getElementById('toggleEmailBtn').addEventListener('click', function() {
        const emailElement = document.getElementById('profileEmail');
        const fullEmail = emailElement.dataset.fullEmail;
        const [username, domain] = fullEmail.split('@');
        const shortEmail = `${username.slice(0, 3)}...@${domain}`;
        
        if (emailElement.textContent === shortEmail) {
            emailElement.textContent = fullEmail;
            this.classList.add('showing');
        } else {
            emailElement.textContent = shortEmail;
            this.classList.remove('showing');
        }
    });
}); 