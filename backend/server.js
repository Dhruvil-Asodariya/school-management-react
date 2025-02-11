const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sm_system"
})

app.get('/subject', (req,res) => {
    const sql = "SELECT * FROM subject_detail";
    db.query(sql, (err, result) => {
        if(err) return res.json({Message: "Error inside server"});
        return res.json(result);
    })
})

app.post("/subject", (req, res) => {
    const { subjectName } = req.body;
  
    if (!subjectName) {
      return res.status(400).json({ message: "Subject name is required" });
    }
  
    const sql = "INSERT INTO subject_detail (subject_name) VALUES (?)";
    db.query(sql, [subjectName], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Subject added successfully", id: result.insertId });
    });
  });

app.listen(8081, () => {
    console.log("listening");
})