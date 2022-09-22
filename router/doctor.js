const dbPool = require("../dbConfig");
const express = require("express");
const { json } = require("express");
const { compare } = require("bcryptjs");

let router = express.Router();

//create doctor field
router.post("/new", async (req, res) => {
  await dbPool.query(
    "CREATE TABLE IF NOT EXISTS doctors(id SERIAL PRIMARY KEY,docId VARCHAR(20), Qualification VARCHAR NOT NULL, Experience NUMERIC NOT NULL,Location VARCHAR, Speciality VARCHAR,Hospital VARCHAR,Contact VARCHAR, TimeSlots jsonb,Earning NUMERIC,name VARCHAR ,fees NUMERIC)"
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
    name,
    fees,
  } = req.body;
  console.log(req.body);
  dbPool.query(
    `INSERT INTO doctors(docId,name,Qualification,Experience,Location,Speciality,Hospital,Contact,TimeSlots,fees) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      docId,
      name,
      qualification,
      experience,
      location,
      speciality,
      hospital,
      contact,
      timeSlots,
      fees,
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
      let data = response.rows;

      let days = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];
      let getTimeSlots = (day, timeSlots) => {
        let slots = [];
        timeSlots[day].available?.map((el) => {
          for (let i = el[0]; i < el[1]; i += 30) {
            slots.push(timeConvert(i));
          }
        });
        timeSlots[day].available = [...slots];
        return timeSlots[day];
      };
      data.map((doc) => {
        days.map((day) => {
          if (doc.timeslots[day].available?.length !== 0) {
            doc.timeslots[day] = getTimeSlots(day, doc.timeslots);
          }
        });
      });

      return res.status(200).send(data);
    }
  });

  function timeConvert(num) {
    var hours = Math.floor(num / 60);
    var minutes = num % 60;
    return hours + ":" + minutes;
  }
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
  let { timeSlots } = req.body;
  dbPool.query(
    "UPDATE doctors SET timeSlots=$1 WHERE docId = $2",
    [timeSlots, docId],
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

module.exports = router;
