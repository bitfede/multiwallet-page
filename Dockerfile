# Build the app inside a build image
FROM node:14-alpine as build
WORKDIR /src

COPY ["package.json", "/src/Client/"]
COPY ["public", "/src/Client/public"]
COPY ["src", "/src/Client/src"]

WORKDIR "/src/Client"

RUN npm install
RUN npm run build

# copy built files to final image and starts app
FROM node:13-alpine

COPY --from=build /src/Client Client

WORKDIR "/Client"

RUN npm install -g serve

ENV NODE_ENV production

CMD ["serve", "-s", "build"]
