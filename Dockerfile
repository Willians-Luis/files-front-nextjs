# # Etapa de build
# FROM node:alpine AS build
# #FROM arm64v8/node:alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# # Expõe a variável de ambiente durante o build
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# RUN npm run build

# # Etapa de produção
# #FROM arm64v8/node:alpine
# FROM node:alpine
# WORKDIR /app
# COPY --from=build /app ./
# COPY package*.json ./
# RUN npm install --production && npm cache clean --force
# EXPOSE 3000
# CMD ["npm", "start"]

# Etapa de build
#FROM node:alpine AS build
FROM arm64v8/node:alpine AS build
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Define a variável de ambiente para o build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Executa o build do Next.js
RUN npm run build

# Etapa de produção
#FROM node:alpine
FROM arm64v8/node:alpine
WORKDIR /app

# Copia apenas os arquivos necessários da etapa de build
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]