const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = { id: decoded.id };

            next();
        } catch (error) {
            console.error('Error de verificación de token:', error);
            res.status(401).json({ message: 'No autorizado' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado' });
    }
};

module.exports = protect;