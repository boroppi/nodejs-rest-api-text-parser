const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.text({ type: "text/html" }));

app.get("/", (req, res) => {
  console.log("Responding to root route");
  res.send(`<h1>Hello from ROOT!</h1>`);
});

// parse email
app.post("/api/parse_email", (req, res) => {
  console.log(req.body);

  res.send(req.body);
});

app.get("/api/workorders", (req, res) => {
  const workorders = {
    id: "1",
    order: "ON124124"
  };

  res.send(workorders);
});

// localhost:3003
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is up and listening on port: ${port}...`);
});
