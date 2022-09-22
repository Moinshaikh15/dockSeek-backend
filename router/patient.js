const dbPool = require("../dbConfig");
const express = require("express");
let router = express.Router();

//create patient field
router.post("/new", async (req, res) => {
  await dbPool.query(
    "CREATE TABLE IF NOT EXISTS patients(id SERIAL PRIMARY KEY,patId VARCHAR(20),Location VARCHAR,Age NUMERIC,Weight VARCHAR,BloodGroup VARCHAR,Gender VARCHAR, pastIssues jsonb)"
  );
  const { patId, location, age, weight, bloodGroup, gender, pastIssues } =
    req.body;
  console.log(req.body);
  dbPool.query(
    `INSERT INTO patients(patId,Location,Age,Weight,BloodGroup,Gender,pastIssues) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [patId, location, age, weight, bloodGroup, gender, pastIssues],
    (err, response) => {
      if (err) {
        return res.status(400).send(err.stack);
      } else {
        return res.status(200).send(response.rows[0]);
      }
    }
  );
});

// get patient Info
router.get("/:patId", (req, res) => {
  let patId = req.params.patId;

  dbPool.query(
    "SELECT * FROM patients WHERE patid = $1",
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

module.exports = router;
