const dbPool = require("../dbConfig");
const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Mailgun = require("mailgun.js");
const formData = require("form-data");

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: "51af62a1b0240822d4732574b7b517ff-78651cec-7280a45e",
});

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

router.post("/reqreset", (req, res) => {
  let { email } = req.body;
  let data;
  dbPool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        data = response.rows[0];
        if (data === undefined) {
          return res.status(400).send("email does not exists");
        }
      }
    }
  );
  // let id = data.id;

  mg.messages
    .create("sandbox3d8591575fb44c8998b1b48fee38b451.mailgun.org", {
      from: "Mailgun Sandbox <shaikhmointest@gmail.com>",
      to: [email],
      subject: "Reset Password",
      text: `password reset link : http://localhost:3000/reset/${email}`,
      html: `password reset link : <a href=http://localhost:3000/reset/${email}>Click on link to reset </a>`,
    })
    .then((msg) => {
      console.log(msg);
      res.status(200).send("link sent");
    }) // logs response data
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});

router.post("/:email/resetpass",async (req, res) => {
  let email = req.params.email;
  let { password } = req.body;
  let salt = await bcryptjs.genSalt(10);
  let hash = await bcryptjs.hash(password, salt);
  dbPool.query(
    "UPDATE users SET password=$1 WHERE email = $2",
    [hash, email],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).json("Password reset successfully");
      }
    }
  );
});
module.exports = router;
