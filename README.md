# Challenge Alura Agente IA - Assistente de E-commerce v2

## 📝 Descrição Geral
Este projeto consiste em um **Agente de Inteligência Artificial** focado no atendimento ao cliente para um e-commerce simulado de eletrônicos. O agente é capaz de ingerir dados brutos estruturados, processar o contexto de negócio e responder a dúvidas de clientes de forma totalmente contextualizada, eliminando alucinações e garantindo respostas precisas sobre faturamento, estoque, preços e políticas de garantia.

## 🏗️ Arquitetura da Solução
A solução foi desenhada para seguir o fluxo clássico de **Context Injection (Injeção de Contexto)** para sistemas baseados em LLM:

1. **Ingestão de Dados (Parsing)**: O sistema utiliza a biblioteca `csv-parser` para realizar o stream de leitura do arquivo local `/data/produtos.csv` contendo a base de conhecimento de produtos.
2. **Construção do Prompt de Sistema**: Os dados do CSV são estruturados em texto legível e encapsulados dentro de uma instrução mestre de comportamento (System Prompt), delimitando estritamente as regras de atendimento da loja.
3. **Orquestração da LLM**: A pergunta do cliente e o bloco de contexto são enviados via SDK oficial da Google para o modelo generativo.
4. **Camada de Nuvem (Deploy)**: A aplicação está implantada de forma isolada na nuvem da Oracle Cloud Infrastructure (OCI).

```text
[ produtos.csv ] ──> ( csv-parser ) ──> [ Prompt de Sistema ]
                                               │
  [ Pergunta do Cliente ] ─────────────────────┼──> ( Gemini 2.0 Flash API ) ──> [ Resposta Contextualizada ]
```

## 🛠️ Tecnologias e Ferramentas Utilizadas
* **Runtime**: Node.js (v20.x+)
* **Modelo de IA**: Google Gemini 2.0 Flash
* **Processamento de Dados**: `csv-parser` (leitura leve de planilhas via Streams)
* **Controle de Versão**: Git & GitHub
* **Nuvem Host**: Oracle Cloud Infrastructure (OCI) - Instância de Compute Linux

## 🚀 Instruções para Executar o Projeto Localmente

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com
   cd agente-alura
   ```
2. **Instalar as dependências** (sem necessidade de privilégios de administrador):
   ```bash
   npm install
   ```
3. **Configurar a chave de API do Gemini**:
   Obtenha uma chave no Google AI Studio e adicione ao seu terminal Linux:
   ```bash
   export GEMINI_API_KEY="sua_chave_aqui"
   ```
4. **Executar o agente**:
   ```bash
   node src/agente.js
   ```

## 💬 Exemplos de Perguntas e Respostas do Agente

### Exemplo 1: Dúvida sobre Garantia
*   **Pergunta do Cliente**: `"O fone de ouvido bluetooth tem garantia se o bluetooth parar de funcionar?"`
*   **Resposta do Agente**: `"Olá! Sim, o Fone Bluetooth Bass+ possui 6 meses de garantia. A política cobre a troca imediata em caso de mau funcionamento do bluetooth."`

### Exemplo 2: Verificação de Estoque Esgotado
*   **Pergunta do Cliente**: `"Vocês têm o Carregador Rápido de 30W disponível?"`
*   **Resposta do Agente**: `"Olá! No momento o Carregador Rápido 30W está esgotado em nosso estoque. Não temos previsão de reposição imediata."`

### Exemplo 3: Produto não cadastrado (Evitando alucinações)
*   **Pergunta do Cliente**: `"Quanto custa o Console Playstation 5?"`
*   **Resposta do Agente**: `"Olá! Lamentamos, mas não possuímos informações sobre o produto 'Console Playstation 5' em nossa base de dados atual."`

## ☁️ Evidências do Deploy na OCI (Oracle Cloud Infrastructure)

A aplicação encontra-se implantada com sucesso na infraestrutura de nuvem da Oracle.

*   **Link Público da Aplicação**: `http://IP_DA_SUA_INSTANCIA_OCI:PORTA` *(Atualizar após o deploy)*

### Captura de Tela do Funcionamento
*(Substitua o caminho abaixo com o print do seu terminal/aplicação rodando dentro do servidor da OCI)*
![Demonstração do Agente na OCI](data/print_deploy_oci.png)
# challenge-alura-agente-ia
