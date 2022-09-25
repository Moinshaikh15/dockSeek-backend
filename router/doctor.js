const dbPool = require("../dbConfig");
const express = require("express");
const { json } = require("express");
const { compare } = require("bcryptjs");
const multer = require("multer");

let router = express.Router();

let storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const uploads = multer({ storage: storage });
//create doctor field
router.post("/new", uploads.single("img"), async (req, res) => {
  await dbPool.query(
    "CREATE TABLE IF NOT EXISTS doctors(id SERIAL PRIMARY KEY,docId VARCHAR(20), Qualification VARCHAR NOT NULL, Experience NUMERIC NOT NULL,Location VARCHAR, Speciality VARCHAR,Hospital VARCHAR,Contact VARCHAR, TimeSlots jsonb,Earning NUMERIC DEFAULT 0,name VARCHAR ,fees NUMERIC,img VARCHAR)"
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
  let imgUrl = req.file
    ? process.env.BASE_URL + "uploads/" + req.file.filename
    : "";
  //let copyslots=timeSlots
  let copyslots = JSON.parse(timeSlots);
  console.log(copyslots);
  console.log(req.body, imgUrl);
  dbPool.query(
    `INSERT INTO doctors(docId,name,Qualification,Experience,Location,Speciality,Hospital,Contact,TimeSlots,fees,img) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      docId,
      name,
      qualification,
      experience,
      location,
      speciality,
      hospital,
      contact,
      copyslots,
      fees,
      imgUrl,
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
      const d = new Date();
      let todaysDay = d.getDay();
      let todaysDate = d.getDate();
      let days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
      let todaysFullDate = (selectedDay) => {
        let diff = days.indexOf(selectedDay) - todaysDay;
        if (diff < 0) {
          diff = days.indexOf(selectedDay) + (7 - todaysDay);
        }
        let d = new Date();
        let totalDaysOfMonth = new Date(
          d.getFullYear(),
          d.getMonth() + 2,
          0
        ).getDate();

        let day = d.getDate() + diff;
        let month = d.getMonth() + 1;
        let year = d.getFullYear();

        if (totalDaysOfMonth < day) {
          month += 1;
          day -= totalDaysOfMonth;
        }
        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [day, month, year].join("-");
      };

      let getTimeSlots = (day, timeSlots) => {
        let slots = [];
        timeSlots[day].available?.map((el) => {
          for (let i = el[0]; i < el[1]; i += 30) {
            slots.push(timeConvert(i));
          }
        });
        timeSlots[day].bookedDate =
          timeSlots[day].bookedDate < todaysFullDate(days[todaysDay])
            ? []
            : timeSlots[day].bookedDate;
        timeSlots[day].available = [...slots];
        timeSlots[day].date = todaysFullDate(day);
        return timeSlots[day];
      };
      data.map((doc) => {
        days.map((day) => {
          doc.timeslots[day] = getTimeSlots(day, doc.timeslots);
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

//update earnings
router.post("/:docId/addearnings", (req, res) => {
  let docId = req.params.docId;
  let { fees } = req.body;
  dbPool.query(
    "UPDATE doctors SET earning = earning + $1 WHERE docId = $2",
    [fees, docId],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send("successfully added");
      }
    }
  );
});

//add rating
router.post("/:docId/addratings", (req, res) => {
  let docId = req.params.docId;
  let { newRatings } = req.body;
  dbPool.query(
    "UPDATE doctors SET rating = 0 WHERE docId = $1",
    [ docId],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send("successfully added");
      }
    }
  );
});

//book slot for doc
router.post("/:docid/bookslot", (req, res) => {
  let docId = req.params.docid;
  let { slot, day, date } = req.body;
  let timeSlots;
  dbPool.query(
    "SELECT timeslots FROM doctors WHERE docId = $1",
    [docId],
    (err, response) => {
      if (err) {
        // return res.status(400).send(err.stack);
      } else {
        timeSlots = response.rows[0].timeslots;
        timeSlots[day].booked.push(slot);
        timeSlots[day].bookedDate = date;
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
      }
    }
  );
  console.log(timeSlots);
});

// edit profile
router.post("/:docId/edit", (req, res) => {
  let docId = req.params.docId;
  let { qualification, speciality, experience, hospital } = req.body;

  dbPool.query(
    "UPDATE doctors SET qualification=$1, speciality=$2, experience=$3, hospital=$4   WHERE docid = $5",
    [qualification, speciality, experience, hospital, docId],
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
