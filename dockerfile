# base stage to have pnpm installed
FROM node:20-alpine3.18 AS development

# development stage
ARG APP
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build ${APP}

# production stage
FROM base AS production
ARG APP
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN cat package.json
RUN npm install
COPY --from=development /usr/src/app/dist ./dist

# Add an env to save ARG
ENV APP_MAIN_FILE=dist/apps/${APP}/main.js
CMD node ${APP_MAIN_FILE}
