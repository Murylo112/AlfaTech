// cadastro.js
    const form = document.getElementById('form-contato'); // O id do seu form é 'form-contato'

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            const result = await response.json();

            if (!response.ok) {
                // Se o servidor retornar um erro (ex: email duplicado)
                throw new Error(result.error || 'Erro ao cadastrar.');
            }

            alert('Cadastro realizado com sucesso!');
            window.location.href = 'login.html'; // Redireciona para a página de login

        } catch (error) {
            alert(error.message);
        }
    });