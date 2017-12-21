FROM node:8

WORKDIR /
ADD ./ /spacteria-server
WORKDIR /spacteria-server
RUN npm install
RUN npm run build

EXPOSE 3590

CMD ["node", "index.js"]
