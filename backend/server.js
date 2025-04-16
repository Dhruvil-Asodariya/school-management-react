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
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { console } = require('inspector');
const { log } = require('console');

const app = express()
// Middleware
app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    // methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
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
        user: "asodariyadhruvil80@gmail.com", // Replace with your email
        pass: "isrp beru suck cryk", // Use App Password if 2FA is enabled
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

const profile_picture_storage = multer.diskStorage({
    destination: path.join(__dirname, "../frontend/public"), // Change this line
    filename: (req, file, cb) => {
        const facultyName = req.body.firstName + "_" + req.body.lastName;
        const uniqueSuffix = Date.now();
        cb(null, facultyName + "_" + uniqueSuffix + path.extname(file.originalname));
    },
});

// ✅ Setup Razorpay Instance
const razorpay = new Razorpay({
    key_id: "YOUR_RAZORPAY_KEY", // Replace with your API key
    key_secret: "SM_SYSTEM_RAZORPAY" // Replace with your secret key
});


// Set up session
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false, // 🔹 Only store sessions after login
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));


//Login
app.post("/login", (req, res) => {
    const { userName, password } = req.body;

    req.session.pass = {
        password: password,
    };

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
            password: user.password,
            id: user.user_id
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

// Forgot Password
const otpStore = {}; // Store OTPs in-memory

app.post("/forgot_password", async (req, res) => {
    const { email } = req.body;
    const userName = email.split("@")[0];

    const findEmail = `
        SELECT email, user_id, first_name, last_name FROM admin_detail WHERE email LIKE ?
        UNION ALL
        SELECT email, user_id, first_name, last_name FROM principal_detail WHERE email LIKE ?
        UNION ALL
        SELECT email, user_id, first_name, last_name FROM student_detail WHERE email LIKE ?
        UNION ALL
        SELECT email, user_id, first_name, last_name FROM faculty_detail WHERE email LIKE ?
        UNION ALL
        SELECT email, user_id, first_name, last_name FROM parent_detail WHERE email LIKE ?
    `;

    const placeholders = new Array(5).fill(`${email}%`);

    db.query(findEmail, placeholders, (err, result) => {
        if (err) {
            console.error("❌ DB Error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        console.log("🔍 Query Result:", result); // Debug: log matching emails

        if (result.length === 0) {
            return res.status(404).json({ error: "Email is not registered!" });
        }


        // ✅ Email exists → Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 1 * 60 * 1000; // 2 minutes

        // ✅ Prepare email
        const mailOptions = {
            from: '"Easy Way Team" <support@easyway.com>',
            to: email,
            subject: "🔐 Password Reset OTP - Edusphere",
            html: `
                <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(to bottom, #2c3e50, #1c2833); color: #fff; border-radius: 10px; text-align: center;">
                    <h1 style="font-size: 26px; margin-bottom: 10px; color: #f1c40f;">🔐 Password Reset Request</h1>
                    <p style="font-size: 16px; color: #ccc;">We received a request to reset your password for <strong>Edusphere</strong>.</p>
                    <div style="margin: 30px 0; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                        <p style="font-size: 18px; margin-bottom: 10px; color: #f1c40f;">Your One-Time Password (OTP) is:</p>
                        <p style="font-size: 32px; font-weight: bold; color: #fff;">${otp}</p>
                        <p style="font-size: 14px; color: #bbb;">This OTP is valid for 1 minutes.</p>
                    </div>
                    <p style="font-size: 14px; color: #eee;">If you didn’t request this, you can safely ignore this email.</p>
                    <div style="margin-top: 30px; font-size: 14px; color: #ccc;">
                        <p>Need help? Contact us at <a href="mailto:support@edusphere.com" style="color: #f1c40f;">support@edusphere.com</a></p>
                        <p>— The Edusphere Team</p>
                    </div>
                </div>
            `,
        };

        // ✅ Send email
        transporter.sendMail(mailOptions, (emailErr, info) => {
            if (emailErr) {
                console.error("❌ Email error:", emailErr);
                return res.status(500).json({ error: "Failed to send OTP email." });
            }

            const { user_id } = result[0]; // ⬅️ Get the user_id from DB result
            const { first_name } = result[0];
            const { last_name } = result[0];
            console.log(user_id);
            // ✅ Store OTP using user_id or email (your choice)
            otpStore[email] = { otp, expiry: otpExpiry };

            // ✅ Store user_id in session
            req.session.u_id = {
                userId: user_id,
                firstName: first_name,
                lastName: last_name,
                email: email,
            };
            console.log("📧 Email sent:", info.response);
            return res.status(200).json({
                message: "OTP sent to your email."
            });
        });
    });
});

// Ensure this is accessible in both forgot and verify routes
app.post("/verify_otp", (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore[email];

    if (!stored || stored.otp !== otp) {
        return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    if (Date.now() > stored.expiry) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP has expired." });
    }

    // ✅ Retrieve user_id
    const findUserId = `
        SELECT user_id FROM admin_detail WHERE email LIKE ?
        UNION ALL
        SELECT user_id FROM principal_detail WHERE email LIKE ?
        UNION ALL
        SELECT user_id FROM student_detail WHERE email LIKE ?
        UNION ALL
        SELECT user_id FROM faculty_detail WHERE email LIKE ?
        UNION ALL
        SELECT user_id FROM parent_detail WHERE email LIKE ?
    `;
    const values = new Array(5).fill(`${email}%`);

    db.query(findUserId, values, (err, result) => {
        if (err || result.length === 0) {
            return res.status(500).json({ error: "User not found or DB error." });
        }

        // ✅ Store user_id in session
        req.session.user_id = result[0].user_id;
        console.log("✅ user_id stored in session:", req.session.user_id);

        delete otpStore[email];
        return res.status(200).json({ message: "OTP verified successfully." });
    });
});
// Reset Password
app.post("/reset_password", async (req, res) => {
    console.log("🧠 Session contents:", req.session);

    const { password } = req.body;
    const userSession = req.session?.u_id;

    if (!userSession?.userId) {
        return res.status(400).json({ error: "User session not found." });
    }

    if (!/^\d{6}$/.test(password)) {
        return res.status(400).json({ error: "Password must be exactly 6 digits." });
    }

    try {
        const hash_password = await bcrypt.hash(password, 10);
        const query = `UPDATE user_detail SET password = ? WHERE user_id = ?`;

        db.query(query, [hash_password, userSession.userId], (err, result) => {
            if (err) {
                console.error("❌ DB Error:", err);
                return res.status(500).json({ error: "Database error." });
            }

            if (result.affectedRows > 0) {
                // ✅ Send confirmation email
                const fullName = `${userSession.firstName} ${userSession.lastName}`.trim();
                const email = userSession.email;
                const mailOptions = {
                    from: '"Easy Way Team" <support@easyway.com>',
                    to: email,
                    subject: "✅ Password Changed - Easy Way",
                    html: `
                        <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(to bottom, #2c3e50, #1c2833); color: #fff; border-radius: 10px; text-align: center;">
                            <h1 style="font-size: 26px; margin-bottom: 10px; color: #2ecc71;">✅ Hello ${fullName},</h1>
                            <p style="font-size: 16px; color: #ccc;">Your password for <strong>Easy Way</strong> has been successfully updated.</p>
                            
                            <div style="margin: 20px auto; background: #34495e; padding: 15px; border-radius: 8px;">
                                <p style="font-size: 16px; color: #f1c40f; margin-bottom: 5px;">🔑 Your new password is:</p>
                                <p style="font-size: 22px; font-weight: bold; color: #fff;">${password}</p>
                            </div>
                
                            <p style="font-size: 14px; color: #bbb;">If you didn’t make this change, please contact support immediately.</p>
                            <div style="margin-top: 30px; font-size: 14px; color: #ccc;">
                                <p>Need help? Contact us at <a href="mailto:support@edusphere.com" style="color: #f1c40f;">support@edusphere.com</a></p>
                                <p>— The Edusphere Team</p>
                            </div>
                        </div>
                    `,
                };


                transporter.sendMail(mailOptions, (emailErr, info) => {
                    if (emailErr) {
                        console.error("❌ Error sending confirmation email:", emailErr);
                    } else {
                        console.log("📧 Confirmation email sent:", info.response);
                    }
                });

                return res.status(200).json({ message: "Password reset successful." });
            } else {
                return res.status(404).json({ error: "User not found." });
            }
        });
    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({ error: "Server error." });
    }
});

// ✅ Session Route (Get Session Data)
app.get("/session", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "No active session" });
    }
    res.json({ user: req.session.user });
});

app.get("/password", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "No active session" });
    }
    res.json({ user: req.session.pass });
});

app.post("/change_password", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const { currentPassword, newPassword } = req.body;
    const userEmail = req.session.user.email;

    req.session.pass = {
        password: newPassword,
    };

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
                req.session.pass = {
                    password: newPassword,
                };
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
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(password, salt);
        const role = "4";
        const fullName = `${firstName} ${lastName}`;

        const checkEmailSQL = "SELECT COUNT(*) AS count FROM user_detail WHERE user_name = ?";
        db.query(checkEmailSQL, [userName], (err, result) => {
            if (err)
                return res
                    .status(500)
                    .json({ error: "Database error while checking email" });

            if (result[0].count > 0) {
                return res.status(400).json({
                    message: "Email already exists. Please use a different email.",
                });
            }


            // Insert user into user_detail
            const user_sql = "INSERT INTO user_detail (user_name, password, role) VALUES (?, ?, ?)";
            const user_values = [userName, hash_password, role];

            db.query(user_sql, user_values, (err, userResult) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const user_id = userResult.insertId; // ✅ Fetching user_id correctly
                console.log("✅ New user ID:", user_id);

                // Insert student into student_detail
                const student_sql = `INSERT INTO student_detail 
                (user_id, first_name, last_name, email, phone_no, emrNumber, date_of_birth, address, gender, class_id, admission_date, image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const student_values = [
                    user_id, firstName, lastName, email, phoneNo, ephoneNo, dob, address, gender, studentClass, admission_date, image
                ];

                db.query(student_sql, student_values, (err, studentResult) => {
                    if (err) {
                        console.error("❌ Error inserting student:", err);
                        return res.status(500).json({ message: "Database error", error: err.message });
                    }

                    // ✅ Send email only after the student record is inserted
                    const mailOptions = {
                        from: '"Easy Way Team" <support@easyway.com>',
                        to: email,
                        subject: "Account Registered Successfully 🎉",
                        html: `
                    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(to bottom, #2c3e50, #1c2833); color: #fff; border-radius: 10px; text-align: center;">
                        
                        <!-- Header -->
                        <h1 style="margin-bottom: 10px; font-size: 28px;">🚀 Welcome to <span style="color: #f39c12;">Edusphere</span>!</h1>
                        <p style="font-size: 16px; color: #ddd;">Hello <strong>${fullName}</strong>, we’re thrilled to have you with us!</p>
            
                        <!-- Content Box -->
                        <div style="background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 10px; backdrop-filter: blur(10px); box-shadow: 0 4px 8px rgba(255, 255, 255, 0.2); margin-top: 20px;">
                            <h3 style="color: #f1c40f;">🔑 Your Login Credentials</h3>
                            <p><strong>👤 Username:</strong> <span style="color: #f1c40f;">${userName}</span></p>
                            <p><strong>🔐 Password:</strong> <span style="color: #e74c3c;">${password}</span></p>
                            <p style="font-size: 14px; color: #e74c3c;"><strong>⚠ Keep your credentials safe and do not share them.</strong></p>
                            
                            <!-- Login Button -->
                            <div style="margin-top: 20px;">
                                <a href="http://localhost:5173/" target="_blank"
                                   style="background: #3498db; color: #fff; padding: 12px 24px; font-size: 18px; font-weight: bold; border-radius: 5px; text-decoration: none; display: inline-block; box-shadow: 0 2px 5px rgba(255, 255, 255, 0.3);">
                                    🔓 Login to Your Account
                                </a>
                            </div>
                        </div>
            
                        <!-- Learning Journey Section -->
                        <div style="margin-top: 20px; text-align: center;">
                            <h2 style="color: #f1c40f;">📖 Your Learning Journey Begins!</h2>
                            <p style="font-size: 16px; color: #ddd;">
                                At <strong style="color: #f39c12;">Edusphere</strong>, we empower students with knowledge and innovation.
                            </p>
                            <p style="font-style: italic; font-size: 14px; color: #bbb;">
                                "Education is the passport to the future, for tomorrow belongs to those who prepare for it today." – Edusphere
                            </p>
                        </div>
            
                        <!-- Footer -->
                        <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                            <p style="font-size: 18px;"><strong>Best Wishes,</strong></p>
                            <p style="font-size: 16px;">🎓 The Edusphere Team</p>
                            <p style="font-size: 14px;">📧 support@edusphere.com | 🌐 <a href="https://www.edusphere.com" style="color: #f1c40f; text-decoration: underline;">www.edusphere.com</a></p>
                        </div>
                    </div>
                `,

                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error("❌ Error sending email:", error);
                            return res.status(500).json({ error: "Email sending failed" });
                        }
                        console.log("📧 Email sent:", info.response);

                        // ✅ Finally, send success response after DB insertion & email
                        res.status(201).json({
                            message: "Student and user added successfully",
                            user_id: user_id,
                            student_id: studentResult.insertId
                        });
                    });
                });
            });
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Student 
const formatDate = (isoDate) => {
    if (!isoDate) return null; // Handle null values
    const date = new Date(isoDate);
    const formattedDate = date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
    return formattedDate;
};

app.put("/student/:id", (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone_number, emr_phone_number, dob, address, gender, class_id } = req.body;

    console.log("Received update request for student ID:", id);
    console.log("Data received:", req.body);

    if (!firstName || !lastName || !phone_number || !address || !gender || !class_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      UPDATE student_detail 
      SET first_name = ?, last_name = ?, phone_no = ?, emrNumber = ?, date_of_birth = ?, address = ?, gender = ?, class_id = ?
      WHERE student_id = ?
    `;

    db.query(
        query,
        [firstName, lastName, phone_number, emr_phone_number, formatDate(dob), address, gender, class_id, id],
        (err, result) => {
            if (err) {
                console.error("Error updating student:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Student not found" });
            }
            res.json({ message: "Student updated successfully!" });
        }
    );
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

// Add Parent
const parent_upload = multer({ storage: storage });
app.post("/parent", parent_upload.single("image"), async (req, res) => {
    try {
        console.log("📥 Request received: Parent Registration");
        console.log("📝 Body Data:", req.body);
        console.log("📂 File Data:", req.file);

        // Extracting form data
        const { firstName, lastName, email, phoneNo, dob, address, gender } = req.body;
        const image = req.file ? req.file.filename : null;
        if (!image) return res.status(400).json({ message: "Image upload failed" });
        console.log(req.session.user);
        // Ensure session email is available
        if (!req.session.user) {
            console.error("❌ Unauthorized: No user email in session");
            return res.status(401).json({ message: "Unauthorized: No user email in session" });
        }

        const sessionEmail = req.session.user.email;
        console.log("🔎 Session email:", sessionEmail);

        // Generate username and password
        const userName = email.split("@")[0];
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(password, salt);
        const role = "5";
        const fullName = `${firstName} ${lastName}`;
        let student_ID;

        // Check if email already exists in user_detail
        const checkEmailSQL = "SELECT COUNT(*) AS count FROM user_detail WHERE user_name = ?";
        db.query(checkEmailSQL, [userName], (err, result) => {
            if (err) {
                console.error("❌ Database error while checking email:", err);
                return res.status(500).json({ error: "Database error while checking email" });
            }

            if (result[0].count > 0) {
                return res.status(400).json({ message: "Email already exists. Please use a different email." });
            }

            // Fetch student's email using session email
            const sql = `SELECT email FROM student_detail WHERE email LIKE ?`;
            const emailSearch = `%${sessionEmail}%`;

            db.query(sql, [emailSearch], (err, result) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.status(500).json({ message: "Server error", error: err.message });
                }

                if (!result || result.length === 0) {
                    console.error("❌ No matching student found.");
                    return res.status(404).json({ message: "No student found with the given email." });
                }

                // Fetch student email
                const matchEmail = result[0].email;
                console.log("✅ Found email:", matchEmail);

                // Fetch student ID
                const studentSql = "SELECT student_id FROM student_detail WHERE email = ?";
                db.query(studentSql, [matchEmail], (err, result) => {
                    if (err) {
                        console.error("❌ Error fetching student ID:", err);
                        return res.status(500).json({ message: "Error fetching student ID", error: err.message });
                    }

                    if (!result || result.length === 0) {
                        console.error("❌ No student ID found.");
                        return res.status(404).json({ message: "Student ID not found for the given email." });
                    }

                    student_ID = result[0].student_id;
                    console.log("✅ Found Student ID:", student_ID);

                    // Insert user into user_detail
                    const user_sql = "INSERT INTO user_detail (user_name, password, role) VALUES (?, ?, ?)";
                    db.query(user_sql, [userName, hash_password, role], (err, userResult) => {
                        if (err) {
                            console.error("❌ Error inserting user:", err);
                            return res.status(500).json({ error: err.message });
                        }

                        const user_id = userResult.insertId;
                        console.log("✅ New user ID:", user_id);

                        // Insert parent into parent_detail
                        const parent_sql = `INSERT INTO parent_detail 
                            (user_id, first_name, last_name, email, phone_no, date_of_birth, address, gender, image, student_id) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                        const parent_values = [user_id, firstName, lastName, email, phoneNo, dob, address, gender, image, student_ID];

                        db.query(parent_sql, parent_values, (err, parentResult) => {
                            if (err) {
                                console.error("❌ Error inserting parent:", err);
                                return res.status(500).json({ message: "Database error", error: err.message });
                            }

                            console.log("✅ Parent record inserted successfully!");

                            // Send Email Notification
                            const mailOptions = {
                                from: '"Easy Way Team" <support@easyway.com>',
                                to: email,
                                subject: "Account Registered Successfully 🎉",
                                html: `
                                    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; padding: 40px; background: #2c3e50; color: #fff; border-radius: 10px; text-align: center;">
                                        <h1>🚀 Welcome to Edusphere!</h1>
                                        <p>Hello <strong>${fullName}</strong>, we’re thrilled to have you with us!</p>
                                        <div style="background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 10px;">
                                            <h3>🔑 Your Login Credentials</h3>
                                            <p><strong>👤 Username:</strong> ${userName}</p>
                                            <p><strong>🔐 Password:</strong> ${password}</p>
                                            <p><strong>⚠ Keep your credentials safe and do not share them.</strong></p>
                                            <a href="http://localhost:5173/" target="_blank" style="background: #3498db; color: #fff; padding: 12px 24px; font-size: 18px; font-weight: bold; border-radius: 5px; text-decoration: none;">🔓 Login to Your Account</a>
                                        </div>
                                        <p>🎓 The Edusphere Team</p>
                                    </div>
                                `,
                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    console.error("❌ Error sending email:", error);
                                    return res.status(500).json({ error: "Email sending failed" });
                                }
                                console.log("📧 Email sent:", info.response);

                                // Send success response after everything is done
                                res.status(201).json({
                                    message: "Parent added successfully",
                                    user_id: user_id,
                                    student_id: studentResult.insertId,
                                });
                            });
                        });
                    });
                });
            });
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Get Parent
app.get('/parent', (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            message: "Unauthorized access",
            session: req.session  // ✅ Debugging: Show session object
        });
    }
    const ID = req.session.user.id;

    const sql = "SELECT student_id FROM parent_detail WHERE student_id = ?";
    db.query(sql, [ID], (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })

})

// Get Principal
app.get('/principal', (req, res) => {
    const sql = "SELECT * FROM principal_detail";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

// Add Principal
const principal_upload = multer({ storage: storage });
app.post("/principal", principal_upload.single("image"), async (req, res) => {
    try {
        console.log("Body Data:", req.body);
        console.log("File Data:", req.file);

        const { firstName, lastName, email, phoneNo, dob, address, gender } = req.body;
        const image = req.file ? req.file.filename : null;
        if (!image) return res.status(400).json({ message: "Image upload failed" });

        const userName = email.split("@")[0];
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(password, salt);
        const role = "2";
        const fullName = `${firstName} ${lastName}`;

        const checkEmailSQL = "SELECT COUNT(*) AS count FROM user_detail WHERE user_name = ?";
        db.query(checkEmailSQL, [userName], (err, result) => {
            if (err)
                return res
                    .status(500)
                    .json({ error: "Database error while checking email" });

            if (result[0].count > 0) {
                return res.status(400).json({
                    message: "Email already exists. Please use a different email.",
                });
            }


            // Insert user into user_detail
            const user_sql = "INSERT INTO user_detail (user_name, password, role) VALUES (?, ?, ?)";
            const user_values = [userName, hash_password, role];

            db.query(user_sql, user_values, (err, userResult) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const user_id = userResult.insertId; // ✅ Fetching user_id correctly
                console.log("✅ New user ID:", user_id);

                // Insert student into student_detail
                const student_sql = `INSERT INTO principal_detail 
                (user_id, first_name, last_name, email, phone_no, date_of_birth, address, gender, image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const student_values = [
                    user_id, firstName, lastName, email, phoneNo, dob, address, gender, image
                ];

                db.query(student_sql, student_values, (err, studentResult) => {
                    if (err) {
                        console.error("❌ Error inserting principal:", err);
                        return res.status(500).json({ message: "Database error", error: err.message });
                    }

                    // ✅ Send email only after the student record is inserted
                    const mailOptions = {
                        from: '"Easy Way Team" <support@easyway.com>',
                        to: email,
                        subject: "Account Registered Successfully 🎉",
                        html: `
                    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(to bottom, #2c3e50, #1c2833); color: #fff; border-radius: 10px; text-align: center;">
                        
                        <!-- Header -->
                        <h1 style="margin-bottom: 10px; font-size: 28px;">🚀 Welcome to <span style="color: #f39c12;">Edusphere</span>!</h1>
                        <p style="font-size: 16px; color: #ddd;">Hello <strong>${fullName}</strong>, we’re thrilled to have you with us!</p>
            
                        <!-- Content Box -->
                        <div style="background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 10px; backdrop-filter: blur(10px); box-shadow: 0 4px 8px rgba(255, 255, 255, 0.2); margin-top: 20px;">
                            <h3 style="color: #f1c40f;">🔑 Your Login Credentials</h3>
                            <p><strong>👤 Username:</strong> <span style="color: #f1c40f;">${userName}</span></p>
                            <p><strong>🔐 Password:</strong> <span style="color: #e74c3c;">${password}</span></p>
                            <p style="font-size: 14px; color: #e74c3c;"><strong>⚠ Keep your credentials safe and do not share them.</strong></p>
                            
                            <!-- Login Button -->
                            <div style="margin-top: 20px;">
                                <a href="http://localhost:5173/" target="_blank"
                                   style="background: #3498db; color: #fff; padding: 12px 24px; font-size: 18px; font-weight: bold; border-radius: 5px; text-decoration: none; display: inline-block; box-shadow: 0 2px 5px rgba(255, 255, 255, 0.3);">
                                    🔓 Login to Your Account
                                </a>
                            </div>
                        </div>
            
                        <!-- Learning Journey Section -->
                        <div style="margin-top: 20px; text-align: center;">
                            <h2 style="color: #f1c40f;">📖 Your Learning Journey Begins!</h2>
                            <p style="font-size: 16px; color: #ddd;">
                                At <strong style="color: #f39c12;">Edusphere</strong>, we empower students with knowledge and innovation.
                            </p>
                            <p style="font-style: italic; font-size: 14px; color: #bbb;">
                                "Education is the passport to the future, for tomorrow belongs to those who prepare for it today." – Edusphere
                            </p>
                        </div>
            
                        <!-- Footer -->
                        <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                            <p style="font-size: 18px;"><strong>Best Wishes,</strong></p>
                            <p style="font-size: 16px;">🎓 The Edusphere Team</p>
                            <p style="font-size: 14px;">📧 support@edusphere.com | 🌐 <a href="https://www.edusphere.com" style="color: #f1c40f; text-decoration: underline;">www.edusphere.com</a></p>
                        </div>
                    </div>
                `,

                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error("❌ Error sending email:", error);
                            return res.status(500).json({ error: "Email sending failed" });
                        }
                        console.log("📧 Email sent:", info.response);

                        // ✅ Finally, send success response after DB insertion & email
                        res.status(201).json({
                            message: "Principal and user added successfully",
                            user_id: user_id,
                            student_id: studentResult.insertId
                        });
                    });
                });
            });
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Principal 
app.put("/principal/:id", (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone_number, address, gender } = req.body;

    if (!firstName || !lastName || !phone_number || !address || !gender) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      UPDATE principal_detail 
      SET first_name = ?, last_name = ?, phone_no = ?, address = ?, gender = ?
      WHERE principal_id = ?  -- ✅ FIX: Changed student_id to principal_id
    `;

    db.query(query, [firstName, lastName, phone_number, address, gender, id], (err, result) => {
        if (err) {
            console.error("Error updating principal:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Principal not found" });
        }
        res.json({ message: "Principal updated successfully!" });
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
    if (!req.session.user) {
        return res.status(401).json({
            message: "Unauthorized access",
            session: req.session
        });
    }

    const role = req.session.user.role;

    let sql;

    if (role == 3) {
        sql = "SELECT * FROM leave_detail WHERE role = 'Student'";
    } else {
        sql = "SELECT * FROM leave_detail WHERE role = 'Faculty'";
    }

    db.query(sql, (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Error inside server", error: err });
        }

        return res.json(result);
    });
});

// Add Leave
app.post('/leave', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { leaveReason, fromDate, toDate } = req.body;
    const { id, role } = req.session.user;

    let role_name, sql;

    if (role === 3) {
        role_name = "Faculty";
        sql = "SELECT first_name, last_name, email FROM faculty_detail WHERE user_id = ?";
    } else {
        role_name = "Student";
        sql = "SELECT first_name, last_name, email FROM student_detail WHERE user_id = ?";
    }

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Error inside server", error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const { first_name, last_name, email } = result[0];
        const fullName = `${first_name} ${last_name}`;
        const start = new Date(fromDate);
        const end = new Date(toDate);
        const oneDay = 1000 * 60 * 60 * 24;
        const diffInDays = Math.round((end - start) / oneDay) + 1;
        const today = new Date();
        const current_date = today.toISOString().split("T")[0];

        const Sql = `INSERT INTO leave_detail (full_name, email, leave_reason, leave_day, applyed_on, role) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

        db.query(Sql, [fullName, email, leaveReason, diffInDays, current_date, role_name], (err, result) => {
            if (err) {
                console.error("SQL Error:", err);
                return res.status(500).json({ message: "Database insertion error", error: err });
            }
            res.status(200).json({ message: "Leave application submitted successfully" });
        });
    });
});

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
                from: '"Easy Way School" <Your-Email@gmail.com>',
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
app.get("/materials", (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "Unauthorized. No active session." });
    }

    const userID = req.session.user.id;
    const { role } = req.session.user;

    // ✅ Roles 1 (Admin), 2 (Parent), 3 (Faculty) get all materials
    if (role == 1 || role == 2 || role == 3) {
        const materialQuery = "SELECT * FROM material_detail";
        db.query(materialQuery, (err, materials) => {
            if (err) {
                console.error("Error fetching materials:", err);
                return res.status(500).json({ error: "Database error" });
            }

            return res.json(materials);
        });
    } else {
        // 👨‍🎓 Assume student role (role === 4 or anything else)
        const classQuery = "SELECT class_id FROM student_detail WHERE user_id = ?";

        db.query(classQuery, [userID], (err, classResult) => {
            if (err) {
                console.error("Error fetching class:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (classResult.length === 0) {
                return res.status(404).json({ error: "Student not found" });
            }

            const studentClass = classResult[0].class_id;

            const materialQuery = "SELECT * FROM material_detail WHERE class = ?";
            db.query(materialQuery, [studentClass], (err, materials) => {
                if (err) {
                    console.error("Error fetching materials:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                return res.json(materials);
            });
        });
    }
});


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

// DELETE Material API
app.delete("/material/:id", (req, res) => {
    const materialId = req.params.id;

    // Get the file name before deleting
    const getFileQuery = "SELECT material_file FROM material_detail WHERE material_id = ?";
    db.query(getFileQuery, [materialId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Material not found" });
        }

        const fileName = result[0].material_file;
        const filePath = path.join(__dirname, "../frontend/public/material", fileName); // Adjust path as needed

        // Delete the file from the server
        fs.unlink(filePath, (fileErr) => {
            if (fileErr && fileErr.code !== "ENOENT") {
                console.error("Error deleting file:", fileErr);
                return res.status(500).json({ message: "Error deleting file", error: fileErr });
            }

            // Delete the record from the database
            const deleteQuery = "DELETE FROM material_detail WHERE material_id = ?";
            db.query(deleteQuery, [materialId], (dbErr) => {
                if (dbErr) {
                    return res.status(500).json({ message: "Database error while deleting", error: dbErr });
                }

                res.status(200).json({ message: "Material deleted successfully" });
            });
        });
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
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(password, salt);
        const role = "3";
        const fullName = `${firstName} ${lastName}`;
        const join_date = new Date().toISOString().split("T")[0];

        const today = new Date();
        const a_dob = new Date(dob);
        const age = today.getFullYear() - a_dob.getFullYear();

        const checkEmailSQL = "SELECT COUNT(*) AS count FROM user_detail WHERE user_name = ?";
        db.query(checkEmailSQL, [userName], (err, result) => {
            if (err)
                return res
                    .status(500)
                    .json({ error: "Database error while checking email" });

            if (result[0].count > 0) {
                return res.status(400).json({
                    message: "Email already exists. Please use a different email.",
                });
            }

            // ✅ First, insert user details into user_detail table
            const user_sql = "INSERT INTO user_detail (user_name, password, role) VALUES (?, ?, ?)";
            const user_values = [userName, hash_password, role];

            db.query(user_sql, user_values, (err, userResult) => {
                if (err) {
                    console.error("❌ Error inserting user:", err);
                    return res.status(500).json({ message: "Error adding user" });
                }

                const user_id = userResult.insertId; // ✅ Fetching newly created user ID
                console.log(`✅ User added with ID: ${user_id}`);

                // ✅ Now, insert faculty details including the user_id
                const faculty_sql = `
                INSERT INTO faculty_detail (user_id, first_name, last_name, email, qualification, phone_no, age, date_of_birth, gender, address, subject, join_date, image)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
                const faculty_values = [user_id, firstName, lastName, email, qualification, phoneNo, age, dob, gender, address, subjects, join_date, image];

                db.query(faculty_sql, faculty_values, (err, facultyResult) => {
                    if (err) {
                        console.error("❌ Error inserting faculty:", err);
                        return res.status(500).json({ message: "Database error" });
                    }

                    const facultyId = facultyResult.insertId;
                    console.log(`✅ Faculty added with ID: ${facultyId}`);

                    // ✅ Finally, send email after both insertions
                    const mailOptions = {
                        from: '"Easy Way School" <Your-Email@gmail.com>',
                        to: email,
                        subject: "Account Registered Successfully 🎉",
                        text: `Hello ${fullName},\n\nYour account has been successfully registered.\n\nHere are your login credentials:\nUsername: ${userName}\nPassword: ${password}\n\nPlease keep this information safe and do not share it with anyone.\n\nThank you!`,
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error("❌ Error sending email:", error);
                        } else {
                            console.log("📧 Email sent:", info.response);
                        }
                    });

                    res.status(201).json({ message: "Faculty added successfully", facultyId, userId: user_id });
                });
            });
        });

    } catch (error) {
        console.error("❌ Server error:", error);
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
    console.log("✅ API /dashboard_totals hit");

    if (!req.session.user) {
        console.log("❌ No session found");
        return res.status(401).json({
            message: "Unauthorized access",
            session: req.session
        });
    }

    const role = req.session.user.role;
    const email = req.session.user.email;
    console.log("✅ User email from session:", email);

    const sql = `
        SELECT email FROM admin_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM principal_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM student_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM faculty_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM parent_detail WHERE email LIKE ?
    `;

    const emailSearch = `%${email}%`;

    db.query(sql, [emailSearch, emailSearch, emailSearch, emailSearch, emailSearch], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Error inside server", error: err.message });
        }
        const matchEmail = result[0].email;
        let queries = {};

        if (role === 1) { // ✅ Corrected comparison
            queries = {
                students: "SELECT COUNT(*) AS total FROM student_detail",
                faculty: "SELECT COUNT(*) AS total FROM faculty_detail",
                principal: "SELECT COUNT(*) AS total FROM principal_detail",
                classes: "SELECT COUNT(*) AS total FROM class_detail",
                subjects: "SELECT COUNT(*) AS total FROM subject_detail",
                pending_fees: "SELECT COALESCE(SUM(tuition_fee + exam_fee), 0) AS total FROM fees_detail WHERE status = 0",
            };
        } else if (role === 4) { // ✅ Corrected comparison
            queries = {
                students: "SELECT COUNT(*) AS total FROM student_detail",
                faculty: "SELECT COUNT(*) AS total FROM faculty_detail",
                principal: "SELECT COUNT(*) AS total FROM principal_detail",
                classes: "SELECT COUNT(*) AS total FROM class_detail",
                subjects: "SELECT COUNT(*) AS total FROM subject_detail",
                pending_fees: "SELECT COALESCE(SUM(tuition_fee + exam_fee), 0) AS total FROM fees_detail WHERE email = ? AND status = 0",
            };
        } else {
            console.log("❌ Unauthorized Role");
            return res.status(403).json({ message: "Unauthorized role" });
        }

        let responseData = {};
        let completedQueries = 0;
        const totalQueries = Object.keys(queries).length;

        console.log("✅ Queries to Execute:", queries);

        for (let key in queries) {
            const query = queries[key];
            const params = key === "pending_fees" && role === 4 ? [matchEmail] : [];

            db.query(query, params, (err, results) => {
                if (err) {
                    console.error(`❌ Error fetching ${key}:`, err);
                    return res.status(500).json({ error: `Database error fetching ${key}` });
                }

                console.log(`✅ Result for ${key}:`, results);
                responseData[key] = results[0]?.total || 0; // Handle NULL results
                completedQueries++;

                if (completedQueries === totalQueries) {
                    console.log("✅ Final API Response:", responseData);
                    res.json(responseData);
                }
            });
        }
    });
});

// Get Master
app.get('/master', (req, res) => {
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
        SELECT image, first_name, last_name FROM admin_detail WHERE email LIKE ?
        UNION ALL
        SELECT image, first_name, last_name FROM principal_detail WHERE email LIKE ?
        UNION ALL
        SELECT image, first_name, last_name FROM student_detail WHERE email LIKE ?
        UNION ALL
        SELECT image, first_name, last_name FROM faculty_detail WHERE email LIKE ?
        UNION ALL
        SELECT image, first_name, last_name FROM parent_detail WHERE email LIKE ?
    `;

    const emailSearch = `%${email}%`;

    db.query(sql, [emailSearch, emailSearch, emailSearch, emailSearch, emailSearch], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Error inside server", error: err.message });
        }
        console.log("✅ Query Result:", result);
        return res.json(result);
    });
});


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
        SELECT email FROM admin_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM principal_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM student_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM faculty_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM parent_detail WHERE email LIKE ?
    `;

    const emailSearch = `%${email}%`;

    db.query(sql, [emailSearch, emailSearch, emailSearch, emailSearch, emailSearch], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Error inside server", error: err.message });
        }
        const matchEmail = result[0].email;
        console.log("✅ Query Result:", result);
        // return res.json(matchEmail);

        const profileQuery = `
        SELECT first_name, last_name, email, phone_no, date_of_birth, address, gender, image FROM admin_detail WHERE email = ?
        UNION ALL
        SELECT first_name, last_name, email, phone_no, date_of_birth, address, gender, image FROM principal_detail WHERE email = ?
        UNION ALL
        SELECT first_name, last_name, email, phone_no, date_of_birth, address, gender, image FROM student_detail WHERE email = ?
        UNION ALL
        SELECT first_name, last_name, email, phone_no, date_of_birth, address, gender, image FROM faculty_detail WHERE email = ?
        UNION ALL
        SELECT first_name, last_name, email, phone_no, date_of_birth, address, gender, image FROM parent_detail WHERE email = ?
    `;

        db.query(profileQuery, [matchEmail, matchEmail, matchEmail, matchEmail, matchEmail], (err, profileResult) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Error retrieving profile", error: err.message });
            }

            console.log("✅ Full Profile Data:", profileResult);
            return res.json({ message: "Profile retrieved successfully", profile: profileResult[0] });


        });

    });

});

// Update Profile 
app.put("/profile_update", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const { role } = req.session.user;
    let table_name;
    switch (role) {
        case 1: table_name = "admin_detail"; break;
        case 2: table_name = "principal_detail"; break;
        case 3: table_name = "faculty_detail"; break;
        case 4: table_name = "student_detail"; break;
        default: table_name = "parent_detail";
    }

    const { firstName, lastName, phoneNo, dob, address, gender, email } = req.body;
    console.log("Updating profile for:", { firstName, lastName, phoneNo, dob, address, gender, email });

    if (!firstName || !lastName || !phoneNo || !dob || !address || !gender || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Ensure user exists before updating
    const checkQuery = `SELECT * FROM ${table_name} WHERE email = ?`;
    db.query(checkQuery, [email], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update profile if user exists
        const updateQuery = `
            UPDATE ${table_name} 
            SET first_name = ?, last_name = ?, phone_no = ?, date_of_birth = ?, address = ?, gender = ?
            WHERE email = ?
        `;

        db.query(updateQuery, [firstName, lastName, phoneNo, dob, address, gender, email], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Profile updated successfully!" });
        });
    });
});

const profile_picture_upload = multer({ storage: profile_picture_storage });

//Change Profile Picture
app.put("/update_profile_picture", profile_picture_upload.single("profilePicture"), async (req, res) => {
    const { email } = req.body;
    const { role } = req.session.user;

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    let table_name;
    switch (role) {
        case 1: table_name = "admin_detail"; break;
        case 2: table_name = "principal_detail"; break;
        case 3: table_name = "faculty_detail"; break;
        case 4: table_name = "student_detail"; break;
        default: table_name = "parent_detail";
    }

    const fetchImageQuery = `SELECT image FROM ${table_name} WHERE email = ?`;

    db.query(fetchImageQuery, [email], (err, imageResult) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Error retrieving profile picture", error: err.message });
        }

        if (imageResult.length > 0) {
            const oldImage = imageResult[0].image;

            // 🚨 Ensure the old image is not "default_profile.jpg" before deleting
            if (oldImage && oldImage !== "default_profile.jpg") {
                const oldImagePath = path.join(__dirname, "../frontend/public", oldImage);

                fs.unlink(oldImagePath, (unlinkErr) => {
                    if (unlinkErr && unlinkErr.code !== "ENOENT") {
                        console.error("⚠️ Error deleting old image:", unlinkErr);
                    } else {
                        console.log("✅ Old profile picture deleted successfully.");
                    }
                });
            }
        }

        // Save new image filename
        const newImagePath = req.file.filename;

        const updateQuery = `UPDATE ${table_name} SET image = ? WHERE email = ?`;

        db.query(updateQuery, [newImagePath, email], (updateErr, result) => {
            if (updateErr) {
                console.error("❌ Database error:", updateErr);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Profile Picture updated successfully!", imageUrl: `/uploads/${newImagePath}` });
        });
    });
});


//Dlete Profile Picture
app.delete("/delete_profile_picture", async (req, res) => {
    const { email } = req.body;
    const { role } = req.session.user;

    let table_name;
    switch (role) {
        case 1: table_name = "admin_detail"; break;
        case 2: table_name = "principal_detail"; break;
        case 3: table_name = "faculty_detail"; break;
        case 4: table_name = "student_detail"; break;
        default: table_name = "parent_detail";
    }

    const fetchImageQuery = `SELECT image FROM ${table_name} WHERE email = ?`;

    db.query(fetchImageQuery, [email], (err, imageResult) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving profile picture", error: err.message });
        }

        if (imageResult.length > 0 && imageResult[0].image) {
            const oldImagePath = path.join(__dirname, "../frontend/public", imageResult[0].image);

            // Delete the old image
            fs.unlink(oldImagePath, (unlinkErr) => {
                if (unlinkErr && unlinkErr.code !== "ENOENT") {
                    console.error("Error deleting image:", unlinkErr);
                    return res.status(500).json({ message: "Failed to delete image" });
                }

                // Update database to remove image reference
                const updateQuery = `UPDATE ${table_name} SET image = "default_profile.jpg" WHERE email = ?`;
                db.query(updateQuery, [email], (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ error: "Database error" });
                    }
                    res.json({ message: "Profile picture deleted successfully!" });
                });
            });
        } else {
            res.status(404).json({ message: "No profile picture found" });
        }
    });
});

// Get Fees
app.get("/fees", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Unauthorized access",
            session: req.session  // ✅ Debugging: Show session object
        });
    }

    const email = req.session.user.email;
    const role = req.session.user.role;
    console.log("✅ User email from session:", email);

    // Use wildcard search for flexible email matching
    const sql = `
        SELECT email FROM admin_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM student_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM faculty_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM parent_detail WHERE email LIKE ?
    `;

    db.query(sql, [`%${email}%`, `%${email}%`, `%${email}%`, `%${email}%`], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Error inside server", error: err.message });
        }

        if (result.length === 0) {
            console.log("❌ No matching email found for:", email);
            return res.status(404).json({ message: "No matching email found" });
        }

        const matchedEmail = result[0].email;
        console.log("✅ Matched Email:", matchedEmail);

        let feeSql;

        if (role == 1 || role == 2 || role == 3) {
            feeSql = "SELECT * FROM fees_detail WHERE status = 0";
        } else {
            feeSql = "SELECT * FROM fees_detail WHERE email = ? AND status = 1";
        }


        // Fetch Fees for the matched Email

        db.query(feeSql, [matchedEmail], (err, feeResult) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Error fetching fees", error: err.message });
            }

            if (feeResult.length === 0) {
                console.log("❌ No fee records found for:", matchedEmail);
                return res.status(404).json({ message: "No fee records found" });
            }

            console.log("✅ Fee Data Fetched:", feeResult);
            res.json(feeResult);
        });
    });
});

// Get Panding Fees
app.get("/pending_fees", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Unauthorized access",
            session: req.session  // ✅ Debugging: Show session object
        });
    }

    const email = req.session.user.email;
    const role = req.session.user.role;
    console.log("✅ User email from session:", email);

    // Use wildcard search for flexible email matching
    const sql = `
        SELECT email FROM admin_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM student_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM faculty_detail WHERE email LIKE ?
        UNION ALL
        SELECT email FROM parent_detail WHERE email LIKE ?
    `;

    db.query(sql, [`%${email}%`, `%${email}%`, `%${email}%`, `%${email}%`], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Error inside server", error: err.message });
        }

        if (result.length === 0) {
            console.log("❌ No matching email found for:", email);
            return res.status(404).json({ message: "No matching email found" });
        }

        const matchedEmail = result[0].email;
        console.log("✅ Matched Email:", matchedEmail);

        let feeSql;

        if (role == 1 || role == 2 || role == 3) {
            feeSql = "SELECT * FROM fees_detail WHERE status = 0";
        } else {
            feeSql = "SELECT * FROM fees_detail WHERE email = ? AND status = 0";
        }


        // Fetch Fees for the matched Email

        db.query(feeSql, [matchedEmail], (err, feeResult) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Error fetching fees", error: err.message });
            }

            if (feeResult.length === 0) {
                console.log("❌ No fee records found for:", matchedEmail);
                return res.status(404).json({ message: "No fee records found" });
            }

            console.log("✅ Fee Data Fetched:", feeResult);
            res.json(feeResult);
        });
    });
});

// ✅ Create Order Route
app.post("/create_order", async (req, res) => {
    const { amount } = req.body; // Amount in paise (₹1 = 100 paise)

    try {
        const options = {
            amount: amount, // Amount in paise
            currency: "INR",
            receipt: "order_rcptid_11",
        };

        const order = await razorpay.orders.create(options);
        res.json({ order_id: order.id, currency: order.currency });
    } catch (error) {
        console.error("❌ Razorpay Order Error:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
});

app.post("/verify_payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        // ✅ Step 1: Generate Expected Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", "SM_SYSTEM_RAZORPAY") // Use Razorpay Secret
            .update(body)
            .digest("hex");

        // ✅ Step 2: Compare Signatures
        if (expectedSignature === razorpay_signature) {
            // ✅ Payment Verified → Update Database (Example Query)
            // await db.query("UPDATE payments SET status='Paid' WHERE order_id=?", [razorpay_order_id]);

            return res.json({ message: "Payment Verified Successfully" });
        } else {
            return res.status(400).json({ message: "Invalid Payment Signature" });
        }
    } catch (error) {
        console.error("❌ Payment Verification Error:", error);
        res.status(500).json({ message: "Payment verification failed" });
    }
});




// Start Server
app.listen(8081, () => {
    console.log("listening");
})