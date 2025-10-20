// produto.js

/**
 * Função principal que busca os detalhes de um produto específico
 * e os exibe na tela.
 */
async function buscarEExibirProduto() {
    // 1. PEGA O ID DO PRODUTO DA URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const detalheProdutoDiv = document.getElementById('detalhe-produto');

    // Se não houver ID na URL, exibe uma mensagem de erro.
    if (!productId) {
        detalheProdutoDiv.innerHTML = '<p style="color: red;">Produto não especificado. Volte para a <a href="index.html">página inicial</a>.</p>';
        return;
    }

    try {
        // 2. FAZ A CHAMADA PARA O BACKEND USANDO O ID
        const response = await fetch(`http://localhost:3000/produtos/${productId}`);

        // Se o servidor retornar um erro (ex: 404 - Not Found), exibe uma mensagem.
        if (!response.ok) {
            throw new Error('Produto não encontrado.');
        }

        const produto = await response.json();

        // 3. CRIA O HTML E PREENCHE O "MOLDE"
        const htmlProduto = `
            <div class="imagem-produto">
                <img src="${produto.imagem_url || 'caminho/para/imagem_padrao.jpg'}" alt="${produto.nome}">
            </div>
            <div class="info-produto">
                <h2>${produto.nome}</h2>
                <span class="preco-detalhe">R$ ${Number(produto.preco).toFixed(2)}</span>
                <h3>Descrição</h3>
                <p>${produto.descricao || 'Este produto não tem uma descrição detalhada.'}</p>
                <p><strong>Em estoque:</strong> ${produto.estoque} unidades</p>
                <button>Adicionar ao Carrinho</button>
            </div>
        `;
        
        detalheProdutoDiv.innerHTML = htmlProduto;

        // Atualiza o título da página para o nome do produto
        document.title = produto.nome;

    } catch (error) {
        console.error('Falha ao buscar detalhes do produto:', error);
        detalheProdutoDiv.innerHTML = `<p style="color: red;">Ocorreu um erro ao carregar o produto. Por favor, tente novamente mais tarde.</p>`;
    }
}

// Chama a função para carregar o produto assim que a página for lida.
buscarEExibirProduto();