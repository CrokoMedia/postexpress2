# Usa a imagem base do Apify com Node.js
FROM apify/actor-node:18

# Copia os arquivos do projeto
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia o código
COPY . ./

# Executa o scraper
CMD npm start
