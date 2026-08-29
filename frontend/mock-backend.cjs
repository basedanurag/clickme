const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.post('/api/auth/signup', (req, res) => {
    console.log("Signup requested", req.body);
    setTimeout(() => res.json({ accessToken: "fake-token", message: "User registered successfully." }), 1000);
});

app.post('/api/auth/login', (req, res) => {
    console.log("Login requested", req.body);
    if (req.body.password === 'password123') {
        setTimeout(() => res.json({ accessToken: "fake-token", message: "Login successful." }), 1000);
    } else {
        res.status(400).json({ message: "Invalid credentials." });
    }
});

app.listen(8080, () => console.log('Mock backend started on 8080'));
