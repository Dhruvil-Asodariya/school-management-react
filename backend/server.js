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

// Get All Subject 
app.get('/subject', (req, res) => {
    const sql = "SELECT * FROM subject_detail";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

// Add New Subject
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

// Update Subject
app.put("/subject/:id", async (req, res) => {
    const { subjectName } = req.body;
    const { id } = req.params;

    if (!subjectName) {
        return res.status(400).json({ error: "Subject name is required" });
    }

    try {
        const sql = "UPDATE subject_detail SET subject_name = ? WHERE subject_id = ?";
        await db.query(sql, [subjectName, id]);

        res.json({ message: "Subject updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update subject" });
    }
});

// Delete Subject
app.delete("/subject/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM subject_detail WHERE subject_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting subject:", err);
            return res.status(500).json({ error: "Failed to delete subject" });
        }
        res.json({ message: "Subject deleted successfully" });
    });
});

// Get Class
app.get('/class', (req, res) => {
    const sql = "SELECT * FROM class_detail";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

// Add New Class
app.post("/class", (req, res) => {
    const { className } = req.body;

    if (!className) {
        return res.status(400).json({ message: "Class name is required" });
    }

    const sql = "INSERT INTO class_detail (class_name) VALUES (?)";
    db.query(sql, [className], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Class added successfully", id: result.insertId });
    });
});

// Update Class
app.put("/class/:id", async (req, res) => {
    const { className } = req.body;
    const { id } = req.params;

    if (!className) {
        return res.status(400).json({ error: "Class name is required" });
    }

    try {
        const sql = "UPDATE class_detail SET class_name = ? WHERE class_id = ?";
        await db.query(sql, [className, id]);

        res.json({ message: "Class updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update class" });
    }
});

// Delete Class
app.delete("/class/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM class_detail WHERE class_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting class:", err);
            return res.status(500).json({ error: "Failed to delete class" });
        }
        res.json({ message: "Class deleted successfully" });
    });
});

// Start Server
app.listen(8081, () => {
    console.log("listening");
})