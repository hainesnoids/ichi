# do not use this dockerfile, but if you want to improve it to a working state go for it
FROM debian:testing-20250520-slim
LABEL authors="hainesnoids"

# install nodejs (old)
RUN apt-get update -y
RUN apt-get install -y nodejs npm

# upgrade nodejs
RUN npm update -g npm

# install dependencies
RUN npm i

# install to env
COPY ./* /usr/src/ichi

# run ichi
ENTRYPOINT ["node", "index.js"]