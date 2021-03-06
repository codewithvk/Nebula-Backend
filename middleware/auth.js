const User = require('../models/user');
const auth = require('../utils/auth');

const { verifyToken } = auth;

const authenticate = async (req, res, next) => {
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end();
  }

  const token = bearer.split('Bearer ')[1].trim();
  let payload;
  try {
    payload = await verifyToken(token);
  } catch (e) {
    return res.status(401).end();
  }

  const user = await User.findById(payload.id).exec();

  if (!user) {
    return res.status(401).end();
  }

  req.user = user;
  next();
};

module.exports = authenticate;
