const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

const app = express()
app.use(cors())

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sm_system'
})
app.get('/', (req,res) => {
    return req.json("From Backend Side");
})

app.get('/subject', (req,res) => {
    const sql = "SELECT * FROM subject_detail"
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.listen(8081, () => {
    console.log("listening");
    
})