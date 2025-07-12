# Dockerfile otimizado para EasyPanel
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json e package-lock.json primeiro (melhor cache do Docker)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production --no-audit

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Etapa de produção com nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]