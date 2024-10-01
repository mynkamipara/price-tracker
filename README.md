# Crypto Price Tracker

This project is a Crypto Price Tracker built with **Nest.js** that automatically monitors the prices of Ethereum and Polygon, and sends alerts based on price changes. It uses the **coinmarketcap** to fetch price data and stores it in a PostgreSQL database. The application is fully Dockerized for easy local deployment.

## Requirements

- **Node.js**
- **Nest.js**
- **PostgreSQL**
- **Docker** and **Docker Compose**

## Features

1. **Price Monitoring**: Automatically saves the price of Ethereum and Polygon every 5 minutes.
2. **Email Alerts**: Sends an email to `youremail@doamin.com` if the price of a chain increases by more than 3% compared to its price one hour ago.
3. **API Endpoints**:
   - Returns the prices of each chain for the last 24 hours.
   - Sets alerts for specific prices (parameters: chain, dollar amount, email).
4. **Dockerized Deployment**: Run the entire application with a single command.

## Setup

### Configuration

Setting up `.env` file in the root directory with the following variables and change as per your data.

## Local Development
# To run the application locally:

```bash
# install dependecies
$ npm install

# run migrations
$ npm run migration:run

# development mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

## Docker Deployment

# To run the application using Docker, execute:

```bash
# install dependecies
$ docker-compose up --build
```

## API Documentation

The API documentation is available via Swagger. You can access it at the following URL:

- **Swagger UI**: [http://127.0.0.1:3000/api](http://127.0.0.1:3000/api)

This interface provides an interactive way to explore the API endpoints, including the ability to test them directly from the browser.


## API Endpoints

### Get Prices

- **Endpoint**: `GET /coins`
- **Description**: Returns the prices of Ethereum and Polygon for the last 24 hours.

- **Endpoint**: `POST /coins/setalert`
- **Description**: Sets an alert for a specific price.


