# Etapa de build
FROM arm64v8/node:alpine AS build
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Define a variável de ambiente ANTES do build
ARG NEXT_PUBLIC_UNLOCK=alfa
ENV NEXT_PUBLIC_UNLOCK=${NEXT_PUBLIC_UNLOCK}

# Executa o build do Next.js
RUN npm run build

# Etapa de produção
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