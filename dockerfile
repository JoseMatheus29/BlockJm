# Dockerfile para backend Node.js
FROM node:18-alpine

# Diretório de trabalho no container
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Expor a porta que o app usa
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "dev"]
