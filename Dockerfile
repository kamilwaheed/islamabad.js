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

# All set!
EXPOSE 3000
CMD ["npm", "start"]
