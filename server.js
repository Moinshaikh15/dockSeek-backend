const express = require("express");
const morgan = require("morgan");
let app = express();
const dbPool = require("./dbConfig.js");
const authRouter = require("./router/auth");
const doctorRouter = require("./router/doctor");
const patientRouter = require("./router/patient");
const appointmentRouter = require("./router/appointment");
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: false }));

app.listen(process.env.PORT || 8000, () => {
  console.log("app running");
});
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use(authenticateRequest);
app.use("/doctor", doctorRouter);
app.use("/patient", patientRouter);
app.use("/appointment", appointmentRouter);

process.on("connect", async () => {
  console.log("connected");
});
process.on("exit", async () => {
  await dbPool.end();
});

function authenticateRequest(req, res, next) {
  let authHeaderInfo = req.headers["authorization"];

  if (authHeaderInfo === undefined) {
    return res.status(400).send("No token was provided");
  }
  let token = authHeaderInfo.split(" ")[1];
  if (token === undefined) {
    return res.status(400).send("Proper token was  not provided");
  }

  try {
    let payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userInfo = payload;
    next();
  } catch (er) {
    return res.status(400).send(er.message);
  }
}
