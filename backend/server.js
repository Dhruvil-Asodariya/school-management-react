const express = require('express')
const session = require("express-session");
const mysql = require('mysql')
const cors = require('cors')
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static("uploads")); // Serve uploaded images

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sm_system"
})

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: ", err);
    } else {
        console.log("Connected to database");
    }
});

// ✅ Nodemailer Configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "Your Email", // Replace with your email
        pass: "Your pass-key", // Use App Password if 2FA is enabled
    },
});

// Set up session
app.use(
    session({
      secret: "mySecretKey", // Change this to a strong secret key
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }, // 1 hour
    })
  );

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../frontend/public"),
    filename: (req, file, cb) => {
        const studentName = req.body.firstName + "_" + req.body.lastName;
        const uniqueSuffix = Date.now();
        cb(null, studentName + "_" + uniqueSuffix + path.extname(file.originalname));
    },
});

//Login
app.post("/login", (req, res) => {
    const { userName } = req.body;
    const { password } = req.body;

    const salt = bcrypt.genSalt(10); // Generate Salt
    const hash_password = bcrypt.hash(password, salt); // Hash Password


});

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

// Get Student
app.get('/student', (req, res) => {
    const sql = "SELECT * FROM student_detail";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

// Add New Student

const upload = multer({ storage: storage });
app.post("/student", upload.single("image"), (req, res) => {
    const { firstName, lastName, email, phoneNo, ephoneNo, dob, address, gender, class: studentClass } = req.body;
    const image = req.file ? req.file.filename : null;
    const addmission_date = new Date().toISOString().slice(0, 10);
    const userName = email.split("@")[0];
    const password = Math.floor(100000 + Math.random() * 900000);
    const salt = bcrypt.genSalt(10); // Generate Salt
    const hash_password = bcrypt.hash(password, salt); // Hash Password

    if (!image) {
        return res.status(400).json({ message: "Image upload failed" });
    }

    const sql = "INSERT INTO student_detail (first_name, last_name, email, phone_number, emrNumber, date_of_birth, address, gender, class_id, admission_date, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [firstName, lastName, email, phoneNo, ephoneNo, dob, address, gender, studentClass, addmission_date, image];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting student: ", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Student successfully added" });
    });

    const login_sql = "INSERT INTO user_detail (user_name, password, role, status) VALUES (?, ?, ?, ?)";
    db.query(login_sql, [userName, hash_password,], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Class added successfully", id: result.insertId });
    });
});

// Update Student 

// Delete Student

app.delete("/student/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM student_detail WHERE student_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting student:", err);
            return res.status(500).json({ error: "Failed to delete student" });
        }
        res.json({ message: "Student deleted successfully" });
    });
});

// Get Notes

app.get('/note', (req, res) => {
    const sql = "SELECT * FROM notes_detail";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

// Add New nOTE
app.post("/note", (req, res) => {
    const { noteContent } = req.body;

    if (!noteContent) {
        return res.status(400).json({ message: "Note content is required" });
    }

    const sql = "INSERT INTO notes_detail (note_content) VALUES (?)";
    db.query(sql, [noteContent], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Note added successfully", id: result.insertId });
    });
});

// Update Note
app.put("/note/:id", async (req, res) => {
    const { noteContent } = req.body;
    const { id } = req.params;

    if (!noteContent) {
        return res.status(400).json({ error: "Note content is required" });
    }

    try {
        const sql = "UPDATE notes_detail SET note_content = ? WHERE note_id = ?";
        await db.query(sql, [noteContent, id]);

        res.json({ message: "Note updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update note" });
    }
});

// Delete Note
app.delete("/note/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM notes_detail WHERE note_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting note:", err);
            return res.status(500).json({ error: "Failed to delete note" });
        }
        res.json({ message: "Note deleted successfully" });
    });
});

// Get Leave
app.get('/leave', (req, res) => {
    const sql = "SELECT * FROM leave_detail";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

// Add New Leave
// app.post("/leave", (req, res) => {
//     const { leaveReason, leaveFrom, leaveTo } = req.body;

//     if (!leaveReason && !leaveFrom && !leaveTo) {
//         return res.status(400).json({ message: "Leave detail is required" });
//     }

//     const sql = "INSERT INTO leave_detail (leave_reason, ) VALUES (?)";
//     db.query(sql, [subjectName], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(201).json({ message: "Subject added successfully", id: result.insertId });
//     });
// });

//Update Status on Leave
app.patch("/leave/:id", (req, res) => {
    const { id } = req.params;
    const { status, email, fullName } = req.body; // Get email & name from frontend

    if (typeof status !== "number") {
        return res.status(400).json({ error: "Invalid status value" });
    }

    const sql = "UPDATE leave_detail SET status = ? WHERE leave_id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error("Error updating leave status:", err);
            return res.status(500).json({ error: "Database update failed" });
        }

        // ✅ If status is Active (1), send an email
        if (status === 1) {
            const mailOptions = {
                from: "Your-email",
                to: email,
                subject: "Leave Request Approved ✅",
                text: `Hello ${fullName},\n\nYour leave request has been approved!\n\nThank you.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                    return res.status(500).json({ error: "Email sending failed" });
                }
                console.log("Email sent:", info.response);
            });
        }

        res.json({ message: "Leave status updated successfully", status });
    });
});


// Start Server
app.listen(8081, () => {
    console.log("listening");
})