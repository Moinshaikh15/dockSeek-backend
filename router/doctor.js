const dbPool = require("../dbConfig");
const express = require("express");
const { json } = require("express");

let router = express.Router();

//create doctor field
router.post("/new", async (req, res) => {
  await dbPool.query(
    "CREATE TABLE IF NOT EXISTS doctors(id SERIAL PRIMARY KEY,docId VARCHAR(20), Qualification VARCHAR NOT NULL, Experience NUMERIC NOT NULL,Location VARCHAR, Speciality VARCHAR,Hospital VARCHAR,Contact VARCHAR, TimeSlots jsonb,Earning NUMERIC )"
  );

  const {
    docId,
    qualification,
    experience,
    location,
    speciality,
    hospital,
    contact,
    timeSlots,
  } = req.body;
  console.log(req.body);
  dbPool.query(
    `INSERT INTO doctors(docId,Qualification,Experience,Location,Speciality,Hospital,Contact,TimeSlots) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      docId,
      qualification,
      experience,
      location,
      speciality,
      hospital,
      contact,
      timeSlots,
    ],
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
  dbPool.query("SELECT * FROM doctors ", (err, response) => {
    if (err) {
      return res.status(400).send(err.stack);
    } else {
      return res.status(200).send(response.rows);
    }
  });
});

// get doctor Info
router.get("/:docId", (req, res) => {
  let docId = req.params.docId;
  dbPool.query(
    "SELECT * FROM doctors WHERE docId = $1",
    [docId],
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
router.post("/:docId/update", (req, res) => {
  let docId = req.params.docId;
  let { TimeSlots } = req.body;
  dbPool.query(
    "UPDATE doctors SET TimeSlots=$1 WHERE docId = $2",
    [TimeSlots, docId],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send(response.rows[0]);
      }
    }
  );
});

// function time_convert(num)
//  {
//   var hours = Math.floor(num / 60);
//   var minutes = num % 60;
//   return hours + ":" + minutes;
// }

// console.log(time_convert(71));
// console.log(time_convert(450));
// console.log(time_convert(1441));

// 2 | 2001  | BDS           |          3 | Nashik,Maharashta,India | BDS         | {"mon": [[11, 1]]}
//   1 | 2000  | MBBS          |          3 | Nashik,Maharashta,India | Orthopedics | {"mon": [[600, 780]]}

module.exports = router;
