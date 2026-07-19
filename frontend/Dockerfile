# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We don't build here directly because we need environment variables at build time
# But for this setup, Vite embeds env vars at build time. 
# So we need to pass build args.
ARG VITE_API_URL
ARG VITE_LOGIN_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LOGIN_URL=$VITE_LOGIN_URL
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
