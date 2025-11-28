// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(express.json()); // Importante para ler JSON enviado pelo frontend

// Conexão com Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- ROTA 1: LISTAR PRODUTOS (Tabela 'produtos') ---
app.get('/produtos', async (req, res) => {
    const categoria = req.query.categoria;
    try {
        let query = supabase.from('produtos').select('*');
        if (categoria) {
            query = query.ilike('categoria', `%${categoria}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ROTA 2: CADASTRO (Cria usuário no Auth + Tabela 'profiles' via Trigger) ---
app.post('/register', async (req, res) => {
    const { email, password, nome } = req.body;

    try {
        // Cria o usuário no sistema de Auth do Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                // Esse dado 'full_name' será pego pelo nosso Trigger SQL e salvo na tabela profiles
                data: { full_name: nome } 
            }
        });

        if (error) throw error;

        res.status(201).json({ message: 'Usuário criado com sucesso!', user: data.user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- ROTA 3: LOGIN (Autentica e verifica Tabela 'profiles') ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Faz Login
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // 2. Busca informações extras na tabela 'profiles' (ex: saber se é ADM)
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // Retorna o token de acesso e os dados do perfil (incluindo is_admin)
        res.json({ 
            session: data.session, 
            user: data.user, 
            profile: profileData 
        });

    } catch (error) {
        res.status(401).json({ error: 'Email ou senha incorretos.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});