const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  //Get the jwt token from the head
 // const token = req.headers["authorization"];
    const token = req.headers.cookie.replace("token=","");
  let jwtPayload;
  //Try to validate the token and get data
  try {
    jwtPayload = jwt.verify(token, 'secret');
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send({ error: "unauthorized" });
    return;
  }
  const { id, email } = jwtPayload;
  const newToken = jwt.sign({ id, email },'secret', {
    expiresIn: "1h",
  });
  res.setHeader("token", newToken);
  next();
};