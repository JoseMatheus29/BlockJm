# Dockerfile para backend Node.js
FROM node:18-alpine

# Diretório de trabalho no container
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Copiar todo o código primeiro (incluindo schema do Prisma)
COPY . . 

# Instalar dependências
RUN npm install --legacy-peer-deps

# Gerar Prisma Client
RUN npx prisma generate --schema=api/prisma/schema.prisma

# Expor a porta que o app usa
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "dev"]

