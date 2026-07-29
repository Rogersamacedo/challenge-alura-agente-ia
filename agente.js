import fs from 'fs';
import csv from 'csv-parser';

// 1. Função para ler o arquivo CSV e transformá-lo em texto legível para a IA
function carregarDadosCSV(caminhoArquivo) {
    return new Promise((resolve, reject) => {
        const linhas = [];
        fs.createReadStream(caminhoArquivo)
            .pipe(csv())
            .on('data', (data) => {
                linhas.push(
                    `ID: ${data.id} | Produto: ${data.produto} | Categoria: ${data.categoria} | ` +
                    `Preço: R$${data.preco} | Estoque: ${data.estoque} unidades | ` +
                    `Avaliação: ${data.avaliacao_clientes}/5 | Garantia: ${data.politica_garantia}`
                );
            })
            .on('end', () => resolve(linhas.join('\n')))
            .on('error', (error) => reject(error));
    });
}

// 2. Função principal do Agente de IA usando HTTP Fetch direto para o OpenRouter
async function executarAgente(perguntaUsuario) {
    try {
        const caminhoCSV = './data/produtos.csv';
                
        // Carrega o contexto dos produtos
        const contextoProdutos = await carregarDadosCSV(caminhoCSV);
        
        // Verifica se a chave de API está presente no sistema do Render
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.log("⚠️ AVISO CRÍTICO: A variável OPENROUTER_API_KEY está vazia ou indefinida no Render!");
        } else {
            console.log(`🔑 Chave encontrada! Começa com: ${apiKey.substring(0, 7)}...`);
        }

        // Estrutura o Prompt do Sistema instruindo o comportamento do Agente
        const promptSistema = 
            `Você é o assistente virtual de atendimento ao cliente de um E-commerce de Eletrônicos.\n` +
            `Sua tarefa é responder a pergunta do usuário utilizando ESTRITAMENTE as informações da base de dados abaixo.\n\n` +
            `[BASE DE DADOS DE PRODUTOS]\n${contextoProdutos}\n\n` +
            `[REGRAS DE ATENDIMENTO]\n` +
            `1. Seja educado, profissional e direto.\n` +
            `2. Se o produto não estiver na base de dados ou a informação não existir, diga gentilmente que não possui essa informação.\n` +
            `3. Nunca invente dados de estoque, preços ou políticas de garantia.\n` +
            `4. Se o estoque estiver zerado (0), avise que o produto está esgotado.`;

        // Faz a chamada HTTP direta para o endpoint correto da API
        const response = await fetch("https://openrouter.ai", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://render.com", // Exigido por algumas rotas do OpenRouter
                "X-Title": "Desafio Alura Agente"
            },
            body: JSON.stringify({
                model: "google/gemini-1.5-flash",
                messages: [
                    { role: 'system', content: promptSistema },
                    { role: 'user', content: perguntaUsuario }
                ]
            })
        });

        // Captura o texto puro primeiro para evitar quebrar o JSON se vier HTML
        const textoPuro = await response.text();

        if (textoPuro.startsWith("<!DOCTYPE")) {
            console.log("❌ O OpenRouter ainda recusou a requisição e devolveu uma página de login HTML.");
            return;
        }

        // Se não for HTML, transforma com segurança em JSON
        const data = JSON.parse(textoPuro);

        // Verifica se a resposta contém as escolhas da IA de forma segura
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            const respostaTexto = data.choices[0].message.content;
            console.log('\n🤖 Resposta do Agente:\n', respostaTexto);
            return respostaTexto;
        } else {
            console.log("Resposta inesperada do servidor:", JSON.stringify(data));
            throw new Error("A API não retornou o JSON no formato esperado.");
        }

    } catch (error) {
        console.error('Erro ao executar o agente:', error.message || error);
    }
}

// --- SIMULAÇÃO DE PERGUNTA PARA TESTE ---
const perguntaTeste = "O fone de ouvido bluetooth tem garantia se o bluetooth parar de funcionar?";
console.log(`👤 Pergunta: "${perguntaTeste}"`);
executarAgente(perguntaTeste);

// 3. Exportação usando o padrão ES Modules
export { executarAgente };
