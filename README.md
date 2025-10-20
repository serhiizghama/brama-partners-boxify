# Brama-Partners-Boxify — Backend

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create an `.env` file in the project root with:
   ```bash
   PORT=3000

   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=user
   DB_PASSWORD=password
   DB_NAME=boxify

   # TypeORM
   DB_SYNC=true   # set false in production
   DB_LOGGING=true
   ```

3. Start PostgreSQL via Docker Compose:
   ```bash
   docker compose up -d
   ```

4. Run the app (dev):
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`.

## Product endpoints (MVP)

- **POST `/products`**
  
  ![Create Product (POST /products)](./screenshots/create-product.png)

- **GET `/products?limit=5&offset=0&search=demo&sort_by=created_at&direction=desc`**
  
  ![Get list (GET /products)](./screenshots/get-list-products.png)

- **PATCH `/products/:id`**
  
  ![PATCH (PATCH /products)](./screenshots/update-product.png)