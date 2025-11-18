const Url = require('../models/urlModel');

function generateUniqueId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

const createShortUrl = async (req, res) => {
    const userId = req.user.id; 
    
    const { originalUrl } = req.body;
    const shortUrl = generateUniqueId(5);
    const urlRegex = new RegExp(/^(http|https):\/\/[^ "]+$/);

    if (!urlRegex.test(originalUrl))
        return res.status(400).json('Url Invalida');

    const url = await Url.findOne({ originalUrl, userId }); 

    if (url) {
        res.json(url);
        return;
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    const newUrl = new Url({ 
        originalUrl, 
        shortUrl, 
        expirationDate,
        userId
    });
    
    await newUrl.save();
    res.json(newUrl);
};

const redirectUrl = async (req, res) => {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });
    if (!url || (url.expirationDate && url.expirationDate < new Date())) {
        res.status(404).json('Url no encontrada o Caducada');
        return;
    }
    url.clicks++;
    await url.save();
    res.redirect(url.originalUrl);
};

const getUrls = async (req, res) => {
    try {
        const urls = await Url.find({ userId: req.user.id }).sort({ _id: -1 }); 
        res.json(urls);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const getDetails = async (req, res) => {
    try {
        const { shortUrl } = req.params;
        
        const url = await Url.findOne({ shortUrl, userId: req.user.id }); 
        
        if (url) {
            res.json(url);
        } else {
            res.status(404).json('URL no encontrada');
        }
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const deleteUrl = async (req, res) => {
    try {
        const { shortUrl } = req.params;
        
        const result = await Url.findOneAndDelete({ 
            shortUrl, 
            userId: req.user.id
        });
        
        if (!result) {
            return res.status(404).json('URL no encontrada o no tienes permiso para eliminarla.');
        }

        res.json('URL deleted');
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

module.exports = { createShortUrl, redirectUrl, getDetails, getUrls, deleteUrl };