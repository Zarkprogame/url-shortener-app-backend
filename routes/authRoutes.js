const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '7d' ,
    }
  );
};

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        
        const token = generateToken(req.user);
        
        const frontendUrl = 'https://zarkshortener.netlify.app';
        
        res.redirect(`${frontendUrl}/auth-success?token=${token}`);
    }
);

module.exports = router;