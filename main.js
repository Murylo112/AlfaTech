// main.js

// Pega a referência da div onde os produtos serão exibidos.
// É uma boa prática fazer isso uma vez só, no início do script.
const listaProdutosDiv = document.getElementById('lista-produtos');

/**
 * Função principal que busca os produtos do nosso servidor Node.js
 * e os exibe na tela.
 */
async function buscarEExibirProdutos() {
  // Verificamos se o elemento 'lista-produtos' realmente existe no HTML.
  if (!listaProdutosDiv) {
    console.error('Erro: Elemento com id "lista-produtos" não foi encontrado na página.');
    return;
  }

  try {
    // 1. FAZ A CHAMADA PARA O SERVIDOR
    // Faz a chamada para a rota '/produtos' do nosso servidor Node.js.
    // Este código não se importa se o servidor usa MongoDB, Supabase ou outro DB.
    const response = await fetch('http://localhost:3000/produtos');

    // Verifica se a resposta do servidor foi bem-sucedida (status 200-299)
    if (!response.ok) {
      // Se não foi, lança um erro para ser pego pelo bloco 'catch'.
      throw new Error(`Erro do servidor: ${response.status}`);
    }

    // Converte a resposta do servidor de JSON para um objeto/array JavaScript.
    const produtos = await response.json();

    // Limpa a lista antes de adicionar os novos itens, para evitar duplicatas.
    listaProdutosDiv.innerHTML = '';

    // Verifica se o array de produtos está vazio.
    if (produtos.length === 0) {
      listaProdutosDiv.innerHTML = '<p>Nenhum produto cadastrado no momento.</p>';
      return;
    }

    // 2. CRIA O HTML PARA CADA PRODUTO
    // Passa por cada produto retornado pelo servidor.
    produtos.forEach(produto => {
      // Cria o card do produto em formato de string HTML.
      // Adicionamos verificações para caso a imagem ou descrição sejam nulas.
      const produtoCard = `
        <div class="produto-card">
          <img src="${produto.imagem_url || 'caminho/para/imagem_padrao.jpg'}" alt="${produto.nome}">
          <h3>${produto.nome}</h3>
          <p>${produto.descricao || 'Sem descrição disponível.'}</p>
          <span class="preco">R$ ${Number(produto.preco).toFixed(2)}</span>
          <p>Estoque: ${produto.estoque}</p>
        </div>
      `;
      // Adiciona o card do produto na div principal.
      listaProdutosDiv.innerHTML += produtoCard;
    });

  } catch (error) {
    // 3. TRATA POSSÍVEIS ERROS
    // Se ocorrer qualquer erro (servidor offline, problema de rede, etc.),
    // ele será capturado aqui.
    console.error('Falha ao buscar produtos:', error);
    // Exibe uma mensagem de erro amigável para o usuário na página.
    listaProdutosDiv.innerHTML = `<p style="color: red;">Ocorreu um erro ao carregar os produtos. Por favor, tente novamente mais tarde.</p>`;
  }
}

// Chama a função para carregar os produtos assim que a página e o script forem lidos.
buscarEExibirProdutos();

// main.js

// Referências aos elementos do HTML
const formCadastro = document.getElementById('form-cadastro');
const mensagemDiv = document.getElementById('mensagem');
const listaUsuariosDiv = document.getElementById('lista-usuarios'); // Para listar os usuários

/**
 * Função para lidar com o envio do formulário de cadastro.
 */
async function cadastrarUsuario(event) {
  // 1. Impede o comportamento padrão do formulário (que é recarregar a página)
  event.preventDefault();

  // 2. Pega os valores dos campos do formulário
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const idade = document.getElementById('idade').value;

  // 3. Cria um objeto com os dados do usuário
  const dadosUsuario = {
    nome: nome,
    email: email,
    idade: Number(idade) // Converte a idade para número
  };

  try {
    // 4. Envia os dados para o servidor (backend) usando fetch
    const response = await fetch('http://localhost:3000/usuarios', {
      method: 'POST', // Método da requisição
      headers: {
        'Content-Type': 'application/json' // Informa que estamos enviando dados em JSON
      },
      body: JSON.stringify(dadosUsuario) // Converte o objeto JavaScript para uma string JSON
    });

    // 5. Trata a resposta do servidor
    if (!response.ok) {
      // Se a resposta não for OK, lança um erro
      throw new Error('Erro ao cadastrar usuário: ' + response.statusText);
    }

    const usuarioSalvo = await response.json();

    // Mostra uma mensagem de sucesso
    mensagemDiv.innerHTML = `<p style="color: green;">Usuário "${usuarioSalvo.nome}" cadastrado com sucesso!</p>`;
    formCadastro.reset(); // Limpa o formulário

    // Opcional: Atualiza a lista de usuários na tela
    buscarEExibirUsuarios();

  } catch (error) {
    console.error('Falha no cadastro:', error);
    mensagemDiv.innerHTML = `<p style="color: red;">Ocorreu um erro ao cadastrar. Tente novamente.</p>`;
  }
}

/**
 * Função para buscar e exibir os usuários (similar à sua de produtos).
 */
async function buscarEExibirUsuarios() {
    try {
        const response = await fetch('http://localhost:3000/usuarios');
        if (!response.ok) {
            throw new Error('Erro ao buscar usuários');
        }
        const usuarios = await response.json();
        
        listaUsuariosDiv.innerHTML = ''; // Limpa a lista
        
        if (usuarios.length === 0) {
            listaUsuariosDiv.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
            return;
        }

        usuarios.forEach(usuario => {
            listaUsuariosDiv.innerHTML += `
                <div class="usuario-card">
                    <h4>${usuario.nome}</h4>
                    <p>Email: ${usuario.email}</p>
                    <p>Idade: ${usuario.idade || 'Não informada'}</p>
                </div>
            `;
        });

    } catch (error) {
        console.error('Falha ao buscar usuários:', error);
        listaUsuariosDiv.innerHTML = `<p style="color: red;">Erro ao carregar a lista de usuários.</p>`;
    }
}


// Adiciona um "ouvinte" para o evento 'submit' do formulário.
// Quando o formulário for enviado, a função 'cadastrarUsuario' será chamada.
formCadastro.addEventListener('submit', cadastrarUsuario);

// Chama a função para carregar os usuários assim que a página carregar
buscarEExibirUsuarios();