const dbPool = require("../dbConfig");
const express = require("express");

let router = express.Router();

//create doctor field
router.post("/new", async (req, res) => {
  await dbPool.query(
    "CREATE TABLE IF NOT EXISTS appointments(id SERIAL PRIMARY KEY,docId VARCHAR(20),patId VARCHAR(20), docName VARCHAR NOT NULL, patName VARCHAR NOT NULL,date VARCHAR,day VARCHAR, startTime VARCHAR NOT NULL,endTime VARCHAR NOT NULL,flag VARCHAR DEFAULT 'pending',fees NUMERIC)"
  );

  const {
    docId,
    patId,
    docName,
    patName,
    date,
    startTime,
    endTime,
    flag,
    fees,
    day,
  } = req.body;
  console.log(req.body);
  dbPool.query(
    `INSERT INTO appointments(docId,patId,docName,patName,date,day,startTime,endTime,flag,fees) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [docId, patId, docName, patName, date, day, startTime, endTime, flag, fees],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send(response.rows[0]);
      }
    }
  );
});

//get all doctors
router.get("/", (req, res) => {
  dbPool.query("SELECT * FROM appointments", (err, response) => {
    if (err) {
      return res.status(400).send(err.stack);
    } else {
      return res.status(200).send(response.rows);
    }
  });
});

// get doctor Info
router.get("/:appointmentId", (req, res) => {
  let appointmentId = req.params.appointmentId;
  dbPool.query(
    "SELECT * FROM appointments WHERE id = $1",
    [appointmentId],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send(response.rows[0]);
      }
    }
  );
});

//update timeSlots
router.post("/:appointmentId/update", (req, res) => {
  let appointmentId = req.params.appointmentId;
  let { flag } = req.body;
  dbPool.query(
    "UPDATE appointments SET flag=$1 WHERE id = $2",
    [flag, appointmentId],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send(response.rows[0]);
      }
    }
  );
});

// add note
router.post("/:appointmentId/addnote", (req, res) => {
  let appointmentId = req.params.appointmentId;
  let { note } = req.body;
  dbPool.query(
    "UPDATE appointments SET note=$1 WHERE id = $2",
    [note, appointmentId],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send(response.rows[0]);
      }
    }
  );
});

module.exports = router;
