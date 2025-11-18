const express = require('express');
const { createShortUrl, redirectUrl, getUrls, getDetails, deleteUrl } = require('../controllers/urlController');
const protect = require('../middleware/auth'); 

const router = express.Router();

router.post('/shorten', protect, createShortUrl);

router.get('/urls', protect, getUrls);

router.get('/details/:shortUrl', protect, getDetails);

router.delete('/delete/:shortUrl', protect, deleteUrl);

router.get('/:shortUrl', redirectUrl);


module.exports = router;