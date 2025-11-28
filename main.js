// main.js

document.addEventListener('DOMContentLoaded', () => {
    const gridProdutos = document.querySelector('.produtos-grid');

    // Se não tiver grid de produtos na página, para o script (ex: página de contato)
    if (!gridProdutos) return;

    // Verifica se o HTML tem um filtro específico (data-categoria)
    // Ex: <div class="produtos-grid" data-categoria="processador">
    const categoriaFiltro = gridProdutos.getAttribute('data-categoria');

    buscarProdutos(categoriaFiltro);
});

async function buscarProdutos(categoria = null) {
    const gridProdutos = document.querySelector('.produtos-grid');
    gridProdutos.innerHTML = '<p class="carregando">Carregando ofertas...</p>';

    try {
        // Monta a URL. Se tiver categoria, adiciona na busca.
        let url = 'http://localhost:3000/produtos';
        if (categoria) {
            url += `?categoria=${categoria}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao conectar com o servidor');

        const produtos = await response.json();

        // Limpa o "Carregando..."
        gridProdutos.innerHTML = '';

        if (produtos.length === 0) {
            gridProdutos.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
            return;
        }

        // Gera os cards
        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.classList.add('produto-card');

            // Garante que o preço seja um número
            const preco = parseFloat(produto.preco).toFixed(2).replace('.', ',');

            card.innerHTML = `
                <img src="${produto.imagem_url || '../IMAGEM/sem-imagem.png'}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
                <p class="specs">${produto.descricao || ''}</p>
                <span class="preco">R$ ${preco}</span>
                <a href="#" class="botao-detalhes">Ver Detalhes</a>
            `;
            gridProdutos.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        gridProdutos.innerHTML = '<p style="color:red">Erro ao carregar produtos. Verifique se o servidor está rodando.</p>';
    }
}
// --- LÓGICA DE CADASTRO ---
const formCadastro = document.getElementById('form-cadastro'); // Precisamos adicionar esse ID no HTML
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmSenha = document.getElementById('confirmar-senha').value;

        if (senha !== confirmSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, password: senha })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Cadastro realizado com sucesso! Faça login.");
                window.location.href = "login.html";
            } else {
                alert("Erro: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor.");
        }
    });
}

// --- LÓGICA DE LOGIN ---
const formLogin = document.getElementById('form-login'); // Precisamos adicionar esse ID no HTML
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: senha })
            });

            const result = await response.json();

            if (response.ok) {
                // Salva os dados no navegador para usar depois
                localStorage.setItem('user_token', result.session.access_token);
                localStorage.setItem('user_profile', JSON.stringify(result.profile));

                // Verifica se é ADM
                if (result.profile.is_admin) {
                    alert(`Bem-vindo ADM, ${result.profile.nome}!`);
                    // window.location.href = "admin-dashboard.html"; // Futura página de ADM
                    window.location.href = "index.html";
                } else {
                    alert(`Bem-vindo, ${result.profile.nome}!`);
                    window.location.href = "index.html";
                }
            } else {
                alert("Erro: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao tentar fazer login.");
        }
    });
}