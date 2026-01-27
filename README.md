## 🚀 BlockJm – Certificação de Documentos em Blockchain

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)](https://expressjs.com/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Ethereum-f7df1e)](https://hardhat.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

BlockJm é um backend que **certifica documentos em uma blockchain Ethereum**.  
Ao enviar um PDF, o sistema:

- 📄 Gera o **hash (SHA‑256)** do arquivo  
- ⛓️ Grava esse hash no contrato inteligente `DocumentCertification`  
- 🗄️ Armazena os metadados (hash, txHash, timestamp, certifier) em um banco MySQL  
- 🔍 Permite consultar certificações por hash ou por endereço do certificador  

Toda a API é documentada via **Swagger** e o projeto vem com suporte a **Docker** para subir todo o ambiente.

---

## 🧱 Arquitetura Geral

- **API REST**: `Node.js + Express`
- **Blockchain**: `Hardhat` (rede local) + `ethers.js`
- **Banco de Dados**: `MySQL 8` + `Prisma ORM`
- **Armazenamento de Arquivos**: diretório local `uploads/` (temporário – arquivo é apagado após certificação)
- **Documentação**: Swagger em `/api-docs`
- **Testes**: Jest + Supertest

Fluxo simplificado:

1. Cliente faz `POST /certification/certify` com um PDF  
2. Backend gera o hash e chama `certificationService.certifyDocument(hash)`  
3. Serviço interage com o contrato `DocumentCertification` (função `certifyDocument(bytes32)`)  
4. Transação é registrada na blockchain e os dados são salvos no MySQL  
5. Consultas posteriores usam:
   - `GET /certification/{hash}` → consulta na blockchain  
   - `GET /certification` ou `GET /certification/certifier/{address}` → consulta no MySQL  

---

## 📦 Funcionalidades Principais

- 🔐 **Autenticação via carteira** (nonce + assinatura):
  - `GET /auth/nonce?address=0x...`
  - `POST /auth/login` com `{ address, signature, nonce }`

- 📄 **Certificação de documentos**:
  - `POST /certification/certify` – upload de PDF (multipart/form-data, campo `file`)
  - Retorna `message`, `documentHash` e `txHash`

- 🔎 **Consulta / gerenciamento**:
  - `GET /certification` – lista todas as certificações (MySQL)
  - `GET /certification/{hash}` – consulta certificação na blockchain
  - `GET /certification/certifier/{address}` – lista certificações por emissor
  - `PUT /certification/{hash}` – atualiza dados no MySQL
  - `DELETE /certification/{hash}` – remove certificação do MySQL

- 📚 **Swagger UI**:
  - `http://localhost:3000/api-docs`

---

## ✅ Requisitos

- **Node.js** 18.x
- **npm** 9+  
- **Docker Desktop** (para o fluxo com Docker)

Opcional (somente se você quiser rodar tudo sem Docker):

- MySQL 8.x instalado localmente

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto, baseado no exemplo abaixo.

### 🔧 Modo Docker (recomendado para apresentação)

```env
# Blockchain
# ⚠️ Use SEMPRE uma chave exclusiva para desenvolvimento/local,
#    NUNCA reutilize chaves de produção ou com fundos reais.
PRIVATE_KEY=0xSEU_PRIVATE_KEY_DEV_AQUI
ALCHEMY_API_KEY=SEU_API_KEY (opcional – usado para sepolia, se necessário)
BLOCKCHAIN_RPC_URL=http://hardhat:8545

# ATENÇÃO: será atualizado depois do deploy do contrato
CONTRACT_ADDRESS=0xSEU_CONTRATO_AQUI

# Banco de Dados (acessado de dentro do container backend)
DATABASE_URL="ENDERECO_AQUI"
MYSQL_ROOT_PASSWORD=SENHA_AQUI
MYSQL_DATABASE=certificationdb

# Backend
PORT=3000
```

### 🔧 Modo desenvolvimento local (sem Docker)

```env
# ⚠️ Chave privada apenas para desenvolvimento (sem fundos reais)
PRIVATE_KEY=0xSEU_PRIVATE_KEY_DEV_AQUI
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0xSEU_CONTRATO_AQUI

DATABASE_URL="ENDERECO_AQUI/certificationdb"
PORT=3000
```

> 🔒 **Nunca** commite `.env` com chaves reais em repositórios públicos.

---

## 🐳 Subindo tudo com Docker (fluxo padrão)

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/JoseMatheus29/BlockJm.git
   cd BlockJm
   ```

2. **Criar `.env`** (como mostrado acima – pode começar com qualquer valor em `CONTRACT_ADDRESS`, ele será atualizado depois)

3. **Subir MySQL e Hardhat**
   ```bash
   docker-compose up -d mysql hardhat
   ```

4. **Instalar dependências (no host)**
   ```bash
   npm install
   npm run prisma:generate
   ```

5. **Criar o schema do banco (Prisma + MySQL dentro do Docker)**
   ```bash
   npx prisma migrate dev --schema=api/prisma/schema.prisma --name init
   ```

6. **Subir o backend (no host ou via Docker)**

   **Opção A – Rodar o backend localmente (mais simples)**  
   ```bash
   npm run dev
   ```

   **Opção B – Subir o backend dentro do Docker**  
   ```bash
   docker-compose up -d backend
   ```

7. **Deploy do contrato na rede Hardhat (container `hardhat`)**

   Com o Hardhat rodando via Docker, o `BLOCKCHAIN_RPC_URL` deve ser `http://hardhat:8545`.  
   Agora faça o deploy:

   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

   A saída será algo como:

   ```text
   💼 Deploy feito por: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
   🎉 Contrato deployado em: 0xABC123...DEF

   📝 Atualize o .env com:
   CONTRACT_ADDRESS=0xABC123...DEF
   ```

8. **Atualizar o `.env` com o endereço do contrato**

   ```env
   CONTRACT_ADDRESS=0xABC123...DEF
   ```

9. **Reiniciar o backend**

   - Se estiver rodando localmente:
     ```bash
     Ctrl + C
     npm run dev
     ```
   - Se estiver em Docker:
     ```bash
     docker-compose restart backend
     ```

🔁 Sempre que **reiniciar a rede Hardhat do Docker do zero**, o contrato é perdido.  
Para voltar a funcionar:

1. Suba `docker-compose up -d hardhat`  
2. Rode novamente `npx hardhat run scripts/deploy.js --network localhost`  
3. Atualize `CONTRACT_ADDRESS` no `.env`  
4. Reinicie o backend

---

## 🧪 Fluxo de uso da API

### 1. Autenticação via carteira (opcional, mas recomendado)

1. **Gerar nonce**
   - `GET /auth/nonce?address=0xSEU_ENDERECO`
2. **Assinar o nonce na carteira do usuário**
3. **Enviar login**
   - `POST /auth/login`
   - Body JSON:
     ```json
     {
       "address": "0xSEU_ENDERECO",
       "signature": "0xASSINATURA",
       "nonce": 123456
     }
     ```

Resposta esperada:

```json
{
  "message": "Login bem-sucedido",
  "address": "0xSEU_ENDERECO"
}
```

### 2. Certificar um documento (PDF)

- **Endpoint**: `POST /certification/certify`  
- **Tipo**: `multipart/form-data`  
- **Campo:** `file` (tipo *File*, PDF)

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3000/certification/certify \
  -F "file=@./meu-documento.pdf"
```

Resposta (exemplo):

```json
{
  "message": "Documento certificado com sucesso",
  "documentHash": "0x5c5d5e...",
  "txHash": "0xabc123..."
}
```

### 3. Consultar certificação por hash

- **Endpoint**: `GET /certification/{hash}`

Exemplo:

```bash
curl http://localhost:3000/certification/0x5c5d5e...
```

Resposta (exemplo):

```json
{
  "documentHash": "0x5c5d5e...",
  "timestamp": "2026-01-10T21:14:13.000Z",
  "certifier": "0x8626f6..."
}
```

### 4. Outras operações

- `GET /certification` – lista tudo (MySQL)
- `GET /certification/certifier/{address}` – lista por emissor
- `PUT /certification/{hash}` – atualiza campos no MySQL
- `DELETE /certification/{hash}` – remove certificação do MySQL

---

## 📘 Swagger / Documentação da API

- Acesse: `http://localhost:3000/api-docs`
- Permite:
  - Navegar por todas as rotas (`Auth`, `Certification`)
  - Executar chamadas diretamente do navegador
  - Ver modelos de request/response

---

## 🧪 Testes

### Testes de backend

```bash
npm test
```

Cobrem:

- Fluxo de autenticação (nonce + login)
- Serviços de certificação (Prisma + contrato mockado)

---

## 🐞 Dicas de Troubleshooting

- **Erro `BAD_DATA` em `getCertification(bytes32)`**  
  - Causa: `CONTRACT_ADDRESS` não aponta para um contrato válido na rede Hardhat atual.  
  - Solução:
    1. Certifique-se que o Hardhat node está rodando (`docker-compose up -d hardhat` ou `npx hardhat node`)
    2. Rode `npx hardhat run scripts/deploy.js --network localhost`
    3. Atualize `CONTRACT_ADDRESS` no `.env`
    4. Reinicie o backend

- **Erro de conexão com MySQL (`Can't reach database server at mysql:3306`)**  
  - Verifique se o container `mysql` está rodando:
    ```bash
    docker ps
    ```
  - Confirme se `DATABASE_URL` está usando `mysql:3306` (Docker) ou `localhost:3306` (local).

- **Upload retornando 400**  
  - Verifique se:
    - Está enviando `multipart/form-data`
    - Key é `file`
    - O arquivo é realmente um PDF (`application/pdf`)

---

## 📄 Licença

Projeto sob licença **ISC** (veja o arquivo `package.json` para detalhes).

---

## 🙋‍♂️ Sobre

Projeto desenvolvido para **demonstração de certificação de documentos em blockchain**, integrando:

- Boas práticas de segurança (ver `SECURITY.md` e `SECURITY_AUDIT.md`)
- Arquitetura limpa de serviços e controllers
- Documentação via Swagger

