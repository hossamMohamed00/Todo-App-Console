# Base Image 
FROM node:alpine

# Downlaod and install dependencies
WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

# Tell the image what to do when it starts as a container
CMD [ "npm","start" ]