const dbPool = require("../dbConfig");
const express = require("express");

//create doctor field
router.post("/new", async (req, res) => {
  await dbPool.query(
    "CREATE TABLE IF NOT EXISTS patient(id SERIAL PRIMARY KEY,petId VARCHAR(20),Location VARCHAR, Diseases jsonb, )"
  );

  const { petId, Location, Diseases } = req.body;
  console.log(req.body);
  dbPool.query(
    `INSERT INTO patient(petId,Location,Diseases) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [petId, Location, Diseases],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send(response.rows[0]);
      }
    }
  );
});

// get doctor Info
router.get("/:patId", (req, res) => {
  let patId = req.params.patId;
  dbPool.query(
    "SELECT * FROM doctors WHERE patId = $1",
    [patId],
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
