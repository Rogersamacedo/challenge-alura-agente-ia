import fs from 'fs';
import csv from 'csv-parser';

// 1. Função para ler o arquivo CSV e transformá-lo em texto legível para a IA
function carregarDadosCSV(caminhoArquivo) {
    return new Promise((resolve, reject) => {
        const lines = [];
        fs.createReadStream(caminhoArquivo)
            .pipe(csv())
            .on('data', (data) => {
                lines.push(
                    `ID: ${data.id} | Produto: ${data.produto} | Categoria: ${data.categoria} | ` +
                    `Preço: R$${data.preco} | Estoque: ${data.estoque} unidades | ` +
                    `Avaliação: ${data.avaliacao_clientes}/5 | Garantia: ${data.politica_garantia}`
                );
            })
            .on('end', () => resolve(lines.join('\n')))
            .on('error', (error) => reject(error));
    });
}

// 2. Função principal do Agente de IA apontando para a API oficial do Google Gemini
async function executarAgente(perguntaUsuario) {
    try {
        const caminhoCSV = './data/produtos.csv';
        const contextoProdutos = await carregarDadosCSV(caminhoCSV);
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("⚠️ AVISO CRÍTICO: A variável GEMINI_API_KEY está vazia no Render!");
            return "Erro de configuração de chave no servidor.";
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

        // URL Oficial do Google Gemini 1.5 Flash (Livre de bloqueios do Cloudflare)
        const url = `https://googleapis.com{apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: `${promptSistema}\n\nPergunta do Cliente: ${perguntaUsuario}` }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        // Mapeamento seguro do retorno padrão da API do Google Gemini
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            const respostaTexto = data.candidates[0].content.parts[0].text;
            return respostaTexto;
        } else if (data && data.error) {
            console.error("❌ Erro retornado pelo Google Gemini:", data.error.message);
            return `Erro na IA: ${data.error.message}`;
        } else {
            console.error("❌ Resposta inesperada do Google:", JSON.stringify(data));
            return "Formato de resposta inválido do servidor de IA.";
        }

    } catch (error) {
        console.error('💥 Falha fatal no agente:', error.message || error);
        return "Houve um erro ao processar sua resposta.";
    }
}

export { executarAgente };
