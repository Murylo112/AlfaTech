// login.js
    const form = document.querySelector('.login-container form');
    const messageArea = document.getElementById('message-area');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: password }) // 'senha' como o backend espera
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao fazer login.');
            }
            
            // Salva o token no navegador para usar depois
            localStorage.setItem('authToken', result.token);

            // Redireciona para o dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            messageArea.innerText = error.message;
            messageArea.style.color = 'red';
        }
    });