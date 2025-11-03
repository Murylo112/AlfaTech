// cadastro.js (MODIFICADO)
const form = document.getElementById('form-cadastro');

if (form) {
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
                throw new Error(result.error || 'Erro ao cadastrar.');
            }

            // MODIFICADO: Redireciona para a página "Verifique seu E-mail"
            window.location.href = 'verifique-email.html';

        } catch (error) {
            alert(error.message);
        }
    });
} else {
    console.error("Form element with ID 'form-cadastro' not found.");
}