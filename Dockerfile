FROM node:8

WORKDIR /
ADD ./ /spacteria-server
WORKDIR /spacteria-server
RUN npm install
RUN npm run build

EXPOSE 443
EXPOSE 80

CMD ["node", "index.js"]
