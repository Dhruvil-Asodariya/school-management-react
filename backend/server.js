const express = require('express')
const session = require("express-session");
const mysql = require('mysql')
const cors = require('cors')
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { userInfo } = require('os');

const app = express()
// Middleware
app.use(cors({
    origin: "http://localhost:5173", // React frontend URL
    credentials: true, // Allow sending cookies
}));
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
        user: "Your email", // Replace with your email
        pass: "Your pass-key", // Use App Password if 2FA is enabled
    },
});

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../frontend/public"),
    filename: (req, file, cb) => {
        const studentName = req.body.firstName + "_" + req.body.lastName;
        const uniqueSuffix = Date.now();
        cb(null, studentName + "_" + uniqueSuffix + path.extname(file.originalname));
    },
});

const faculty_storage = multer.diskStorage({
    destination: path.join(__dirname, "../frontend/public"),
    filename: (req, file, cb) => {
        const facultyName = req.body.firstName + "_" + req.body.lastName;
        const uniqueSuffix = Date.now();
        cb(null, facultyName + "_" + uniqueSuffix + path.extname(file.originalname));
    },
});

const material_storage = multer.diskStorage({
    destination: path.join(__dirname, "../frontend/public/material"),
    filename: (req, file, cb) => {
        const material_name = req.body.materialTitle + " " + req.body.chapter; // Fix: Use `chapter`, not `selectedChapters`
        cb(null, material_name + path.extname(file.originalname));
    },
});

// Set up session
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false, // 🔹 Only store sessions after login
    cookie: { secure: false, httpOnly: true, maxAge: 60 * 60 * 1000 }
}));


//Login

app.post("/login", (req, res) => {
    const { userName, password } = req.body;

    const sql = "SELECT * FROM user_detail WHERE user_name = ?";

    db.query(sql, [userName], async (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Server error" });
        }

        if (result.length === 0) {
            return res.status(401).json({ error: "Username not registered" });
        }

        const user = result[0];
        const hashedPassword = user.password;

        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // ✅ Store User Data in Session
        req.session.user = {
            userName: user.user_name,
            email: user.user_name,
            role: user.role,
            password: user.password
        };

        console.log("Session After Login:", req.session); // ✅ Check session

        return res.json({
            message: "Login successful",
            user: req.session.user
        });
    });
});

app.post("/logout", (req, res) => {
    res.clearCookie("connect.sid"); // Adjust cookie name if needed
    req.session.destroy(() => {
        res.status(200).json({ message: "Logged out successfully" });
    });
});


// ✅ Session Route (Get Session Data)
app.get("/session", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "No active session" });
    }
    res.json({ user: req.session.user });
});

app.post("/change_password", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const { currentPassword, newPassword } = req.body;
    const userEmail = req.session.user.email;

    try {
        // Fetch user from DB
        const sql = "SELECT password FROM user_detail WHERE user_name = ?";
        db.query(sql, [userEmail], async (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Server error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const hashedPassword = result[0].password;

            // Compare passwords
            const isMatch = await bcrypt.compare(currentPassword, hashedPassword);
            if (!isMatch) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }

            // Hash new password
            const saltRounds = 10;
            const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password in DB
            const updateSql = "UPDATE user_detail SET password = ? WHERE user_name = ?";
            db.query(updateSql, [newHashedPassword, userEmail], (updateErr) => {
                if (updateErr) {
                    console.error("Update Error:", updateErr);
                    return res.status(500).json({ error: "Could not update password" });
                }

                res.json({ message: "Password changed successfully" });
            });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
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

app.post("/student", upload.single("image"), async (req, res) => {
    try {
        console.log("Body Data:", req.body);
        console.log("File Data:", req.file);

        const { firstName, lastName, email, phoneNo, ephoneNo, dob, address, gender, class: studentClass } = req.body;
        const image = req.file ? req.file.filename : null;
        if (!image) return res.status(400).json({ message: "Image upload failed" });

        const admission_date = new Date().toISOString().slice(0, 10);
        const userName = email.split("@")[0];
        const password = Math.floor(100000 + Math.random() * 900000).toString();; // Password should be a string
        const salt = await bcrypt.genSalt(10); // Await here
        const hash_password = await bcrypt.hash(password, salt); // Await here
        const role = "1";
        const fullName = firstName + " " + lastName;

        const sql = `INSERT INTO student_detail 
                     (first_name, last_name, email, phone_no, emrNumber, date_of_birth, address, gender, class_id, admission_date, image) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [firstName, lastName, email, phoneNo, ephoneNo, dob, address, gender, studentClass, admission_date, image];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error inserting student:", err);
                return res.status(500).json({ message: "Database error" });
            }

            const user_sql = "INSERT INTO user_detail (user_name, password, role) VALUES (?, ?, ?)";
            const user_values = [userName, hash_password, role];
            db.query(user_sql, user_values, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: "Student and user added successfully", id: result.insertId });


                const mailOptions = {
                    from: "Your Email",
                    to: email,
                    subject: "Account Registered Successfully 🎉",
                    text: `Hello ${fullName},\n\nYour account has been successfully registered.\n\nHere are your login credentials:\nUsername: ${userName}\nPassword: ${password}\n\nPlease keep this information safe and do not share it with anyone.\n\nThank you!`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error("Error sending email:", error);
                        return res.status(500).json({ error: "Email sending failed" });
                    }
                    console.log("Email sent:", info.response);
                });
            });
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Student 
app.put("/student/:id", (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone_number, emr_phone_number, dob, address, gender, class: studentClass } = req.body;

    const query = `
      UPDATE student_detail 
      SET first_name = ?, last_name = ?, phone_no = ?, emrNumber = ?, date_of_birth = ?, address = ?, gender = ?, class_id = ?
      WHERE student_id = ?
    `;

    db.query(query, [firstName, lastName, phone_number, emr_phone_number, dob, address, gender, studentClass, id], (err, result) => {
        if (err) {
            console.error("Error updating student:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json({ message: "Student updated successfully!" });
    });
});

// Delete Student

app.delete("/student/:id", (req, res) => {
    const { id } = req.params;

    const getImageSql = "SELECT image FROM student_detail WHERE student_id = ?";
    db.query(getImageSql, [id], (err, result) => {
        if (err) {
            console.error("Error fetching student image:", err);
            return res.status(500).json({ error: "Failed to delete student" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const imagePath = result[0].image; // Assuming "image" is the column storing the file path


        const sql = "DELETE FROM student_detail WHERE student_id = ?";
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error("Error deleting student:", err);
                return res.status(500).json({ error: "Failed to delete student" });
            }

            // 3️⃣ **Delete the Image File from `public` Folder**
            if (imagePath) {
                const fullPath = path.join(__dirname, "../frontend/public", imagePath); // Adjust path
                fs.unlink(fullPath, (err) => {
                    if (err && err.code !== "ENOENT") {
                        console.error("Error deleting profile image:", err);
                    }
                });
            }

            res.json({ message: "Student deleted successfully" });
        });
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

// Add New Note
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

//     const sql = "INSERT INTO leave_detail (full_name, email, leave_reason, leave_from, leave_to, applyed_on,) VALUES (?)";
//     db.query(sql, [subjectName], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(201).json({ message: "Leave added successfully", id: result.insertId });
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

//Get Material

app.get('/material', (req, res) => {
    const sql = "SELECT * FROM material_detail";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

// Add New Material

const material_upload = multer({ storage: material_storage });

// ✅ API Route to Upload Material
app.post("/material", material_upload.single("file"), async (req, res) => {
    try {
        console.log("Body Data:", req.body);
        console.log("File Data:", req.file);

        const { materialTitle, class: materialClass, subject, chapter } = req.body;
        const file = req.file ? req.file.filename : null; // Fix: Use `filename`, not `materialname`

        if (!file) return res.status(400).json({ message: "File upload failed" });

        const sql = `INSERT INTO material_detail 
                 (material_title, class, subject, chapter, material_file) 
                 VALUES (?, ?, ?, ?, ?)`;
        const values = [materialTitle, materialClass, subject, chapter, file]; // Fix: Use `file`, not `image`

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error inserting material:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Material uploaded successfully" });
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const MATERIALS_DIR = path.join(__dirname, "../frontend/public/material");

app.use("/material", express.static(MATERIALS_DIR));

// ✅ API to Download a File
app.get("/download/:fileName", (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(MATERIALS_DIR, fileName);

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(500).json({ message: "File not found" });
        }
    });
});

// Get Faculty
app.get('/faculty', (req, res) => {
    const sql = "SELECT * FROM faculty_detail";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

//Add Faculty
const faculty_upload = multer({ storage });

app.post("/faculty", faculty_upload.single("image"), async (req, res) => {
    try {
        const { firstName, lastName, email, qualification, phoneNo, dob, gender, address, subjects } = req.body;
        const image = req.file ? req.file.filename : null;

        const userName = email.split("@")[0];
        const password = Math.floor(100000 + Math.random() * 900000).toString(); // Convert to string
        const salt = await bcrypt.genSalt(10); // Await inside async function
        const hash_password = await bcrypt.hash(password, salt); // Await inside async function
        const role = "3";
        const fullName = `${firstName} ${lastName}`;
        const join_date = new Date().toISOString().split("T")[0];
        const today = new Date(); // Current date as Date object
        const a_dob = new Date(dob); // Convert DOB string to Date object

        const age = today.getFullYear() - a_dob.getFullYear();

        // Insert faculty details into the database
        const sql = `
            INSERT INTO faculty_detail (first_name, last_name, email, qualification, phone_no, age, date_of_birth, gender, address, subject, join_date, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [firstName, lastName, email, qualification, phoneNo, age, dob, gender, address, subjects, join_date, image];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error inserting faculty:", err);
                return res.status(500).json({ message: "Database error" });
            }

            const facultyId = result.insertId;
            console.log(`Faculty added with ID: ${facultyId}`);

            // Insert user details into user_detail table
            const user_sql = "INSERT INTO user_detail (user_name, password, role) VALUES (?, ?, ?)";
            const user_values = [userName, hash_password, role];

            db.query(user_sql, user_values, (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(500).json({ message: "Error adding user" });
                }

                console.log(`User added with ID: ${result.insertId}`);
                res.status(201).json({ message: "Faculty and user added successfully", facultyId });

                // Send email after successful database entry
                const mailOptions = {
                    from: "Your email",
                    to: email,
                    subject: "Account Registered Successfully 🎉",
                    text: `Hello ${fullName},\n\nYour account has been successfully registered.\n\nHere are your login credentials:\nUsername: ${userName}\nPassword: ${password}\n\nPlease keep this information safe and do not share it with anyone.\n\nThank you!`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error("Error sending email:", error);
                    } else {
                        console.log("Email sent:", info.response);
                    }
                });
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update Faculty Details
app.put("/faculty/:id", (req, res) => {
    const { id } = req.params;
    const { name, mobile, gender, education, subject } = req.body;
    const [firstName, lastName] = name.split(" "); // Splitting full name into first & last

    const updateQuery = `
      UPDATE faculty_detail
      SET first_name = ?, last_name = ?, phone_no = ?, gender = ?, qualification = ?, subject = ? 
      WHERE faculty_id = ?
    `;

    db.query(updateQuery, [firstName, lastName, mobile, gender, education, subject, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Faculty updated successfully" });
    });
});

// Add New Holiday
app.post("/holiday", (req, res) => {
    const { holidayName, date } = req.body;

    if (!holidayName || !date) {
        return res.status(400).json({ message: "Holiday name and date are required" });
    }

    const parsedDate = new Date(date); // Convert string to Date object

    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
    }

    const monthNumber = parsedDate.getMonth() + 1; // Convert zero-based month to 1-based

    const sql = "INSERT INTO holiday_detail (month_id, holiday_name, holiday_date) VALUES (?, ?, ?)";
    const values = [monthNumber, holidayName, date];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Holiday added successfully", id: result.insertId });
    });
});

// Get Holiday
app.get("/holiday/:month", (req, res) => {
    const monthNumber = parseInt(req.params.month);

    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({ message: "Invalid month number" });
    }

    const sql = "SELECT * FROM holiday_detail WHERE month_id = ? ORDER BY holiday_date";

    db.query(sql, [monthNumber], (err, results) => {
        if (err) {
            console.error("Error fetching holidays:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ✅ Update Holiday
app.put("/holiday/:id", (req, res) => {
    const holidayId = req.params.id;
    const { holiday_name, holiday_date } = req.body;

    if (!holiday_name || !holiday_date) {
        return res.status(400).json({ message: "Holiday name and date are required" });
    }

    const parsedDate = new Date(holiday_date);

    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
    }

    const monthNumber = parsedDate.getMonth() + 1;

    const sql = "UPDATE holiday_detail SET month_id = ?, holiday_name = ?, holiday_date = ? WHERE holiday_id = ?";

    db.query(sql, [monthNumber, holiday_name, holiday_date, holidayId], (err, result) => {
        if (err) {
            console.error("Error updating holiday:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Holiday not found" });
        }

        res.json({ message: "Holiday updated successfully" });
    });
});

// 📌 Delete Holiday
app.delete("/holiday/:id", (req, res) => {
    const holiday_id = req.params.id;
    const query = "DELETE FROM holiday_detail WHERE holiday_id = ?";

    db.query(query, [holiday_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to delete holiday!" });
        res.json({ message: "Holiday deleted successfully!" });
    });
});

//Get Dashboard Count
app.get("/dashboard_totals", (req, res) => {
    const queries = {
        students: "SELECT COUNT(*) AS total FROM student_detail",
        teachers: "SELECT COUNT(*) AS total FROM faculty_detail",
        classes: "SELECT COUNT(*) AS total FROM class_detail",
        subjects: "SELECT COUNT(*) AS total FROM subject_detail",
    };

    let responseData = {};

    // Execute all queries
    let completedQueries = 0;
    for (let key in queries) {
        db.query(queries[key], (err, results) => {
            if (err) {
                console.error(`Error fetching ${key} total:`, err);
                return res.status(500).json({ error: "Database error" });
            }

            // Extract total from result
            responseData[key] = results[0].total;
            completedQueries++;

            // Send response after all queries finish
            if (completedQueries === Object.keys(queries).length) {
                res.json(responseData);
            }
        });
    }
});

// Get Profile
app.get('/profile', (req, res) => {
    console.log("🔍 Session Debug:", req.session); // ✅ Log session

    if (!req.session.user) {
        return res.status(401).json({
            message: "Unauthorized access",
            session: req.session  // ✅ Return session object for debugging
        });
    }

    const email = req.session.user.email;
    console.log("✅ User email from session:", email);

    const sql = `
        SELECT image, first_name, last_name FROM student_detail WHERE email LIKE ?
        UNION ALL
        SELECT image, first_name, last_name FROM faculty_detail WHERE email LIKE ?
        UNION ALL
        SELECT image, first_name, last_name FROM parent_detail WHERE email LIKE ?
    `;

    const emailSearch = `%${email}%`;

    db.query(sql, [emailSearch, emailSearch, emailSearch], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Error inside server", error: err.message });
        }
        console.log("✅ Query Result:", result);
        return res.json(result);
    });
});





// Start Server
app.listen(8081, () => {
    console.log("listening");
})