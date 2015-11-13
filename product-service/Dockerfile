FROM hypriot/rpi-node:4.1.2

# Adding source files into container
ADD src/ /src

# Define working directory
WORKDIR /src

# Install app dependencies
RUN npm install

# Open Port 8000
#EXPOSE 8000

# Run Node.js
CMD ["node", "index.js"]
