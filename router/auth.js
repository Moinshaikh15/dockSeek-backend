const dbPool = require("../dbConfig");
const express = require("express");
const bcryptjs = require("bcryptjs");
var jwt = require("jsonwebtoken");
let router = express.Router();

// signup
router.post("/signup", async (req, res) => {
  dbPool.query(
    "CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,docId VARCHAR(20),patId VARCHAR(20), name VARCHAR(30) NOT NULL, email VARCHAR(100) NOT NULL,password VARCHAR NOT NULL)"
  );

  const { name, email, password, confirmPassword, docId, patId } = req.body;
  console.log(req.body);
  if (password !== confirmPassword) {
    return res.status(400).send("passwords does not match");
  }
  let salt = await bcryptjs.genSalt(10);
  let hash = await bcryptjs.hash(password, salt);
  dbPool.query(
    `INSERT INTO users(docId,patId,name,email,password) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [docId, patId, name, email, hash],
    (err, response) => {
      if (err) {
        console.log(err.stack);
        return res.status(400).send(err.stack);
      } else {
        console.log(response.rows[0]);
        return res.status(200).send(response.rows[0]);
      }
    }
  );
});

// login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  dbPool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    async (err, response) => {
      if (err) {
        console.log(err.stack);
        return res.status(400).send(err.stack);
      } else {
        console.log(response.rows);
        let existingUser = response.rows[0];
        if (existingUser !== undefined) {
          let correctPass = await bcryptjs.compare(
            password,
            existingUser.password
          );
          if (correctPass) {
            let payload = {
              id: existingUser.id,
              email: existingUser.email,
            };
            let accessToken = jwt.sign(
              payload,
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "1d",
              }
            );
            let refreshToken = jwt.sign(
              payload,
              process.env.REFRESH_TOKEN_SECRET,
              {
                expiresIn: "3d",
              }
            );
            existingUser.password = undefined;
            return res
              .status(200)
              .send({ accessToken, refreshToken, userInfo: existingUser });
          }
          return res.status(200).send("passwords does not match");
        }
        return res.status(400).send("email does not exists");
      }
    }
  );
});

// Token
router.get("/token", (req, res) => {
  let refreshToken = req.body.token;
  if (!refreshToken) {
    return res.status(400).send("please provide refresh token");
  }

  try {
    let payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    delete payload.exp;
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "3d",
    });
    return res.status(200).send({ accessToken });
  } catch (err) {
    return res.status(400).send(err.message);
  }
});
module.exports = router;
