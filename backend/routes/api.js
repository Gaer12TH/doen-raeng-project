const express = require('express');
const router = express.router ? express.Router() : express();
// Note: router is usually express.Router()
const { getVideoInfo, downloadVideo } = require('../controllers/videoController');

const api = express.Router();

api.post('/info', getVideoInfo);
api.get('/download', downloadVideo);

module.exports = api;
