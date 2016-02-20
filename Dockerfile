FROM node:5.6.0
MAINTAINER kamil@quixel.se

# Bundle app source
RUN mkdir /src
COPY . /src

# Create log directory
RUN mkdir /var/log/islamabadjs

# Set working directory
WORKDIR /src

# Install app dependencies
RUN cd /src; npm install

# Build app
RUN cd /src; npm run build

# All set!
EXPOSE 8000
CMD ["npm", "start"]
