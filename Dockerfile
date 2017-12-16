FROM node:8

WORKDIR /
ADD ./ /spacteria-server
WORKDIR /spacteria-server
RUN npm install

EXPOSE 3590

CMD ["node", "index.js"]
