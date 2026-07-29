import fs from 'fs';
import csv from 'csv-parser';
import https from 'https';

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

// 2. Função principal do Agente de IA usando HTTPS Nativo (À prova de falhas de rede)
async function executarAgente(perguntaUsuario) {
    return new Promise(async (resolveReject, rejectFn) => {
        try {
            const caminhoCSV = './data/produtos.csv';
            const contextoProdutos = await carregarDadosCSV(caminhoCSV);
            
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.error("⚠️ AVISO CRÍTICO: A variável GEMINI_API_KEY está vazia no Render!");
                return resolveReject("Erro de configuração de chave no servidor.");
            }

            const promptSistema = 
                `Você é o assistente virtual de atendimento ao cliente de um E-commerce de Eletrônicos.\n` +
                `Sua tarefa é responder a pergunta do usuário utilizando ESTRITAMENTE as informações da base de dados abaixo.\n\n` +
                `[BASE DE DADOS DE PRODUTOS]\n${contextoProdutos}\n\n` +
                `[REGRAS DE ATENDIMENTO]\n` +
                `1. Seja educado, profissional e direto.\n` +
                `2. Se o produto não estiver na base de dados, diga gentilmente que não possui essa informação.`;

            // Monta o corpo da requisição no formato exato que o Google exige
            const dadosCorpo = JSON.stringify({
                contents: [{
                    parts: [{ text: `${promptSistema}\n\nPergunta do Cliente: ${perguntaUsuario}` }]
                }]
            });

            // Configurações da conexão HTTPS nativa
            const opcoes = {
                hostname: '://googleapis.com',
                port: 443,
                path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dadosCorpo)
                }
            };

            // Abre o canal de comunicação direta com o Google
            const requisicao = https.request(opcoes, (resposta) => {
                let dadosRecebidos = '';

                resposta.on('data', (pedaco) => {
                    dadosRecebidos += pedaco;
                });

                resposta.on('end', () => {
                    try {
                        const data = JSON.parse(dadosRecebidos);

                        // Mapeia com precisão a estrutura de resposta do Google Gemini
                        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                            const respostaTexto = data.candidates[0].content.parts[0].text;
                            resolveReject(respostaTexto);
                        } else if (data?.error) {
                            console.error("❌ Erro da API Google:", data.error.message);
                            resolveReject(`Erro na IA: ${data.error.message}`);
                        } else {
                            console.error("❌ Resposta inesperada do Google:", dadosRecebidos);
                            resolveReject("Formato de resposta inválido do servidor.");
                        }
                    } catch (e) {
                        console.error("❌ Falha ao processar JSON do Google:", e.message);
                        resolveReject("Erro ao interpretar dados da IA.");
                    }
                });
            });

            requisicao.on('error', (erroRede) => {
                console.error("💥 Erro de conexão HTTPS:", erroRede.message);
                resolveReject("Erro de conexão com o servidor da IA.");
            });

            // Envia os dados e fecha a requisição de saída
            requisicao.write(dadosCorpo);
            requisicao.end();

        } catch (error) {
            console.error('💥 Falha fatal no agente:', error.message || error);
            resolveReject("Houve um erro ao processar sua resposta.");
        }
    });
}

export { executarAgente };

