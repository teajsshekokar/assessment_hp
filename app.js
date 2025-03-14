const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const path = require('path');
const winston = require('winston');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' })
    ]
});

// Environment variables
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'postgres-postgresql';
const POSTGRES_DB = process.env.POSTGRES_DB || 'helloprint';
const POSTGRES_USER = process.env.POSTGRES_USER || 'admin';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'admin';
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432;
const TABLE_NAME = process.env.TABLE_NAME || 'users';

// PostgreSQL connection
const pool = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT
});

// Redis connection
const REDIS_HOST = process.env.REDIS_HOST || 'redis-master';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient({
    url: `redis://${REDIS_HOST}`,
    // port: REDIS_PORT
});
redisClient.connect();

// Get data from Redis or DB
async function getDataFromCache() {
    logger.info('Fetching data from Redis');
    let cachedData = await redisClient.get('data');
    if (cachedData) {
        logger.info('Cache hit, serving data from Redis');
        return JSON.parse(cachedData);
    }
    
    logger.info('Cache miss, fetching data from PostgreSQL');
    const { rows } = await pool.query(`SELECT * FROM ${TABLE_NAME}`);
    if (rows.length === 0) {
        logger.warn('No data found in database');
        return null;
    }
    
    await redisClient.set('data', JSON.stringify(rows), { EX: 60 }); // Cache for 60 seconds
    logger.info('Data cached in Redis');
    return rows;
}

app.get('/get_data', async (req, res) => {
    try {
        logger.info('GET /get_data request received');
        const data = await getDataFromCache();
        if (!data) {
            logger.warn('No data found to serve');
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json(data);
    } catch (error) {
        logger.error(`Error in /get_data: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/put_data', async (req, res) => {
    try {
        logger.info('POST /put_data request received', { requestBody: req.body });
        const { name } = req.body;
        if (!name) {
            logger.warn('Validation error: Name is required');
            return res.status(400).json({ error: 'Name is required' });
        }
        
        await pool.query(`INSERT INTO ${TABLE_NAME} (name) VALUES ($1)`, [name]);
        await redisClient.del('data'); // Clear cache to refresh data
        logger.info('New data inserted and cache cleared');
        res.status(201).json({ message: 'Data inserted successfully' });
    } catch (error) {
        logger.error(`Error in /put_data: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    logger.info('Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(5001, () => {
    logger.info('Server running on port 5001');
});
