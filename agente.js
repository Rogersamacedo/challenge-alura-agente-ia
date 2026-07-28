import fs from 'fs';
import csv from 'csv-parser';
import { GoogleGenAI } from '@google/genai';

// 1. Inicializar a API do Gemini (Ela busca automaticamente a variável GEMINI_API_KEY)
// Substitua o texto abaixo pela sua chave real copiada do AI Studio
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Função para ler o arquivo CSV e transformá-lo em texto legível para a IA
function carregarDadosCSV(caminhoArquivo) {
    return new Promise((resolve, reject) => {
        const linhas = [];
        fs.createReadStream(caminhoArquivo)
            .pipe(csv())
            .on('data', (data) => {
                // Formata cada linha do CSV em uma frase clara para o contexto da IA
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

// Função principal do Agente de IA
async function executarAgente(perguntaUsuario) {
    try {
        const caminhoCSV = './data/produtos.csv';
        
        // Carrega o contexto dos produtos
        const contextoProdutos = await carregarDadosCSV(caminhoCSV);

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

        // Chama o modelo correto do Gemini (gemini-2.5-flash é ideal para agentes rápidos)
        const response = await ai.models.generateContent({
            model:'gemini-2.0-flash',
            contents: [
                { role: 'user', parts: [{ text: `${promptSistema}\n\nPergunta do Cliente: ${perguntaUsuario}` }] }
            ]
        });

        console.log('\n🤖 Resposta do Agente:\n', response.text);

    } catch (error) {
        console.error('Erro ao executar o agente:', error.message);
    }
}

// --- SIMULAÇÃO DE PERGUNTA ---
// Substitua o texto abaixo pela pergunta que deseja testar
const perguntaTeste = "O fone de ouvido bluetooth tem garantia se o bluetooth parar de funcionar?";
console.log(`👤 Pergunta: "${perguntaTeste}"`);

executarAgente(perguntaTeste);
