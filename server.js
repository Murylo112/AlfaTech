// server.js (VERSÃO FINAL - ADICIONANDO VERIFICAÇÃO AO CÓDIGO ORIGINAL)

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const nodemailer = require('nodemailer'); // NOVO: para enviar e-mails
const path = require('path');           // NOVO: para lidar com caminhos de arquivos
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // ADICIONADO: para ser flexível

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- NOVO: CONFIGURAÇÃO PARA SERVIR SEUS ARQUIVOS DE FRONT-END ---
// Baseado na sua estrutura de pastas (ALFATECH-MAIN)
app.use(express.static(path.join(__dirname, 'meu-app-login', 'templates')));
app.use('/js', express.static(path.join(__dirname, 'meu-app-login', 'js')));
app.use(express.static(path.join(__dirname, 'meu-app-login')));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/IMAGEM', express.static(path.join(__dirname, 'IMAGEM')));


// --- NOVO: Configuração do Nodemailer (Serviço de E-mail) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Lembre-se de configurar no seu arquivo .env
        pass: process.env.EMAIL_PASS  // Lembre-se de configurar no seu arquivo .env
    }
});


// --- ROTAS DE AUTENTICAÇÃO ---

// ROTA DE CADASTRO (POST /cadastro) - MODIFICADA PARA ENVIAR E-MAIL
app.post('/cadastro', async (req, res) => {
  try {
    const { nome } = req.body;
    const email = req.body.email.trim();
    const { senha } = req.body;
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const tokenVerificacao = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const sql = "INSERT INTO usuarios (nome, email, senha, token_verificacao) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [nome, email, senhaCriptografada, tokenVerificacao]);

    const linkVerificacao = `http://localhost:3000/verificar-email?token=${tokenVerificacao}`;
    await transporter.sendMail({
        from: `"Alfatech" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifique seu endereço de e-mail',
        html: `<h2>Olá, ${nome}!</h2><p>Clique no link para ativar sua conta: <a href="${linkVerificacao}">Verificar E-mail</a></p>`
    });

    res.status(201).json({ message: "Cadastro quase completo! Verifique seu e-mail para ativar sua conta." });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Este email já está em uso.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar usuário: ' + err.message });
  }
});


// ROTA DE LOGIN (POST /login) - LÓGICA ORIGINAL MANTIDA, APENAS UMA VERIFICAÇÃO ADICIONADA
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const sql = "SELECT * FROM usuarios WHERE email = ?";
        const [rows] = await db.query(sql, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
        
        const usuario = rows[0];

        // --- ADIÇÃO CRÍTICA ---
        // Adicionamos esta verificação ANTES de comparar a senha.
        if (!usuario.email_verificado) {
            return res.status(403).json({ error: 'Por favor, verifique seu e-mail antes de fazer o login.' });
        }
        // --- FIM DA ADIÇÃO ---

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // A SUA RESPOSTA DE SUCESSO ORIGINAL FOI MANTIDA EXATAMENTE IGUAL.
        // É o front-end (login.js) que usa essa resposta para redirecionar.
        res.json({ message: 'Login bem-sucedido!', token: token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao fazer login: ' + err.message });
    }
});


// --- NOVAS ROTAS PARA O PROCESSO DE VERIFICAÇÃO ---

// ROTA ACESSADA PELO LINK DO E-MAIL
app.get('/verificar-email', async (req, res) => {
    try {
        const { token } = req.query;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        const updateSql = "UPDATE usuarios SET email_verificado = TRUE, token_verificacao = NULL WHERE email = ?";
        await db.query(updateSql, [payload.email]);

        res.sendFile(path.join(__dirname, 'meu-app-login', 'templates', 'verificacao-sucesso.html'));
    } catch (err) {
        res.status(400).send('<h1>Link de verificação inválido ou expirado.</h1>');
    }
});

// ROTA PARA O BOTÃO "REENVIAR E-MAIL"
app.post('/reenviar-email', async (req, res) => {
    try {
        const { email } = req.body;
        const sqlFind = "SELECT * FROM usuarios WHERE email = ?";
        const [rows] = await db.query(sqlFind, [email]);

        if (rows.length === 0 || rows[0].email_verificado) {
            return res.json({ message: 'Se uma conta com este email existir, um novo link de verificação foi enviado.' });
        }
        
        const usuario = rows[0];
        const tokenVerificacao = jwt.sign({ email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const sqlUpdate = "UPDATE usuarios SET token_verificacao = ? WHERE email = ?";
        await db.query(sqlUpdate, [tokenVerificacao, usuario.email]);

        const linkVerificacao = `http://localhost:3000/verificar-email?token=${tokenVerificacao}`;
        await transporter.sendMail({
            from: `"Alfatech" <${process.env.EMAIL_USER}>`,
            to: usuario.email,
            subject: 'Reenvio de Verificação de E-mail',
            html: `<h2>Olá, ${usuario.nome}!</h2><p>Clique no link para ativar sua conta: <a href="${linkVerificacao}">Verificar E-mail</a></p>`
        });

        res.json({ message: 'Se uma conta com este email existir, um novo link de verificação foi enviado.' });
    } catch (err) {
        res.status(500).json({ error: 'Ocorreu um erro interno.' });
    }
});


// --- SUAS ROTAS ORIGINAIS (INTACTAS) ---

// Middleware para verificar o token JWT
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ROTA PROTEGIDA PARA OBTER DADOS DO USUÁRIO
app.get('/me', verificarToken, (req, res) => {
    res.json({ username: req.user.nome });
});

// ROTAS DE PRODUTOS
app.get('/produtos', async (req, res) => {
    try {
        const [produtos] = await db.query("SELECT * FROM produtos ORDER BY id DESC");
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

app.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM produtos WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});


// --- Iniciando o Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Acesse seu site em http://localhost:${port}/login.html`);
});