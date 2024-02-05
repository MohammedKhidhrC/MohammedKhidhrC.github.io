// app.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'chatbot', // Your database name
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Function to get a dynamic response based on user input
function getDynamicResponse(userMessage) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT response FROM responses WHERE ? LIKE CONCAT("%", keyword, "%")';
        pool.query(query, [userMessage.toLowerCase()], (err, results) => {
            if (err) {
                reject(err);
            } else {
                const response = results[0] ? `Bot: ${results[0].response}` : "Bot: I'm not sure how to respond to that. Can you be more specific?";
                resolve(response);
            }
        });
    });
}

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        // Use the function to generate a dynamic response
        const botResponse = await getDynamicResponse(userMessage);

        res.json({ botResponse });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
