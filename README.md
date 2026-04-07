# Product Catalog - Backend API

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![AWS EC2](https://img.shields.io/badge/Amazon_EC2-FF9900?style=for-the-badge&logo=amazon-ec2&logoColor=white)
![AWS S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

RESTful API developed to manage the product catalog. This service acts as the "engine" of the Full Stack application, managing data persistence in a relational database and the orchestration of static files in the cloud.

## Architecture and Infrastructure

The application was designed to be scalable and secure, running in a real production environment on the Amazon Web Services (AWS) cloud:

- **Hosting:** AWS EC2 Instance (Ubuntu).
- **Reverse Proxy & Web Server:** Nginx configured to receive requests on ports 80 and 443, forwarding them to the application running internally on port 3000.
- **Security (SSL/TLS):** Security certificate generated via Let's Encrypt (Certbot), ensuring encrypted traffic (HTTPS) and preventing *Mixed Content* blocks with the frontend.
- **Dynamic DNS:** Custom domain routed via No-IP.
- **File Storage:** Direct integration with AWS S3 via AWS SDK. Equipment images are sent via *multipart/form-data*, stored in an S3 Bucket, and the public URL is saved in the database.

## Technologies Used

- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Cloud Storage:** Amazon S3
- **Infrastructure:** AWS EC2, Nginx, Certbot

## Environment Variables (.env)

To run this project locally, create a `.env` file in the root of the project with the following keys:

```env
# Database Config
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=product_catalog

# AWS S3 Config
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name

## How to Run Locally

1. Clone this repository:
```bash
git clone [https://github.com/YOUR-USERNAME/product-catalog-api.git](https://github.com/YOUR-USERNAME/product-catalog-api.git)
```
2. Install dependencies:
```bash
npm install
```
3. Set up the PostgreSQL database and ensure the `.env` credentials are correct.
4. Start the server in development mode:
```bash
npm run start:dev
```
5. The API will be running at `http://localhost:3000`.

## Main Endpoints

- `GET /products` - Returns the list of all equipment in the catalog.
- `POST /products` - Creates new equipment (supports image upload).
- `PUT /products/:id` - Updates the information of existing equipment.
- `DELETE /products/:id` - Removes the equipment from the database.

---
*Developed as part of a Full Stack architecture*
