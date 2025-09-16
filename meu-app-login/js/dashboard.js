 // dashboard.js

    // Esta função roda assim que a página carrega
    (async function() {
        const token = localStorage.getItem('authToken');

        // Se não houver token, o usuário não está logado. Redireciona para o login.
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        try {
            // Busca os dados do usuário na rota protegida
            const response = await fetch('http://localhost:3000/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Envia o token para o servidor
                }
            });

            if (!response.ok) {
                // Se o token for inválido ou expirado, o servidor dará erro.
                // Limpamos o token antigo e redirecionamos para o login.
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
                return;
            }

            const data = await response.json();
            document.getElementById('welcome-message').innerText = `Bem-vindo(a), ${data.username}!`;

        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            // Em caso de qualquer outro erro, manda para o login por segurança
            window.location.href = 'login.html';
        }
    })(); // A função se auto-executa