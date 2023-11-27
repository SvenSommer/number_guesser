const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

let secretNumber = 0;
let maxNumber = 100; // Default value

app.use(express.static('public'));

// Function to generate a random number
function generateRandomNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}

// Endpoint to start a new game
app.get("/start", (req, res) => {
  maxNumber = req.query.maxNumber ? parseInt(req.query.maxNumber, 10) : 100;
  secretNumber = generateRandomNumber(maxNumber);
  res.json({ maxNumber: maxNumber });
});

// Serve the HTML page
app.get("/", (req, res) => {
  maxNumber = req.query.maxNumber ? parseInt(req.query.maxNumber, 10) : 100;
  secretNumber = generateRandomNumber(maxNumber);
  res.sendFile(__dirname + '/public/index.html');
});


// Handle guess
app.get("/guess/:number", (req, res) => {
    const guessedNumber = parseInt(req.params.number, 10);
    if (guessedNumber === secretNumber) {
        res.json({ result: "correct" });
    } else if (guessedNumber < secretNumber) {
        res.json({ result: "higher" });
    } else {
        res.json({ result: "lower" });
    }
});

const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
