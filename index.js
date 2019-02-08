const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.text({
  type: "text/html"
}));

app.get("/", (req, res) => {
  console.log("Responding to root route");
  res.send(`<h1>Hello from ROOT!</h1>`);
});

// parse email
app.post("/api/parse_email", (req, res) => {
  let object = parseEmail(req.body);
  let script = generateInsertScript(object)
  res.send(script);
});

// localhost:3003
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is up and listening on port: ${port}...`);
});

function parseEmail(email) {
  // Initialize empty object to be filled later
  let json = {};

  // Workorder
  const workorder_expr = /Work Order.([^\.]*)/;
  let workorder = workorder_expr.exec(email)[1];
  json.workorder = workorder;

  // Approved by
  const approved_by_name_expr = /Approved by:[\n\r].*Name:\s*([^\n\r]*)/;
  const approved_by_email_expr = /Approved by:[\n\r].*[\n\r]*Email:\s*([^\n\r]*)/;
  let approved_by_name = approved_by_name_expr.exec(email)[1];
  let approved_by_email = approved_by_email_expr.exec(email)[1];
  json.approvedBy = {};
  json.approvedBy.approvedByName = approved_by_name;
  json.approvedBy.approvedByEmail = approved_by_email;

  // Requester
  const requester_name_expr = /Requester:[\n\r].*Name:\s*([^\n\r]*)/;
  const requester_email_expr = /Requester:[\n\r].*[\n\r]*Email:\s*([^\n\r]*)/;
  json.requester = {};
  json.requester.requesterName = requester_name_expr.exec(email)[1];
  json.requester.requesterEmail = requester_email_expr.exec(email)[1];

  // Item requested
  const item_requested_expr = /\s*Item requested:\s*([^\n\r]*)/
  json.itemRequested = item_requested_expr.exec(email)[1];

  // Request type
  const request_type_expr = /\s*Request type:\s*([^\n\r]*)/
  json.requestType = request_type_expr.exec(email)[1];

  // Request details
  const cluster_name_expr = /\s*Cluster Name:\s*([^\n\r]*)/
  const role_expr = /\s*Role:\s*([^\n\r]*)/
  const servers_expr = /\s*Server\(s\) to be added:\s*([^\n\r]*)/
  const users_expr = /\s*User\(s\) to be added:\s*([^\n\r]*)/
  json.requestDetails = {};
  json.requestDetails.clusterName = cluster_name_expr.exec(email)[1];
  json.requestDetails.role = role_expr.exec(email)[1];
  json.requestDetails.servers = servers_expr.exec(email)[1].split(/\s*,\s*/);
  let users = users_expr.exec(email)[1];
  users = users.split(/(?<=\))\,\s/);
  json.requestDetails.users = users;

  //Payment details
  const cost_centre = /\s*Cost Centre:\s*([^\n\r]*)/
  json.paymentDetails = {};
  json.paymentDetails.costCentre = cost_centre.exec(email)[1];

  return json;
}


function generateInsertScript(object) {

  var script = "";

  let {
    role
  } = object.requestDetails;

  for (var server of object.requestDetails.servers) {
    for (var user of object.requestDetails.users) {
      script += `INSERT INTO [dbo].[Process] ([server],[user_name],[role],[action]) VALUES ('${server}','${user}','${role}','ADD');\n`
    }
  }

  return script;
}