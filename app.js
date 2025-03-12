/*
* Title: Example Messenger App

* Desciption: This is an example application that demonstrates how to handle Webhook notification events. Webhook
*   notification events are triggered when a Business's Facebook page or Instagram page receives a message. This application
*   should be able to receive context from the webhook notification event payload and provide logic for handling the case.
* Relevant Links: https://developers.facebook.com/docs/messenger-platform/webhooks/
*/
const express = require("express");
require('dotenv').config();

const app = express();

/*
* Config
*/
const requiredEnvVars = ['VERIFY_TOKEN'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
const config = {
  port: parseInt(process.env.PORT) || 3000,
  verifyToken: process.env.VERIFY_TOKEN,
};

/*
 * Middlewares
 */
app.use(express.json());

/*
 * Route used for testing that the application is running
 */
app.get("/ping", (req, res) => {
  res.send("pong!");
});

/* Route used for Webhook verification. A verification request is sent from Meta when a Webhooks
 * product is configured in your Developers App Dashboard.
 *
 * Test Request:
 *    curl -X GET "localhost:3000/messaging-webhook?hub.verify_token=EXAMPLE-VERIFY-TOKEN&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
 * Expected Response:
 *    CHALLENGE_ACCEPTED
 */
app.get("/messaging-webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let verifyToken = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && verifyToken) {
    if (mode === "subscribe" && verifyToken === config.verifyToken) {
      // Respond with the challenge token from the request
      console.log("Messaging webhook has been verified.");
      res.status(200).send(challenge);
    } else {
      console.log("Failed to verify messing webhook");
      res.sendStatus(403);
    }
  }
});

/*
 * Route that accepts Messenger Webhook notification events.
 *
 * Test Request:
 *    curl -H "Content-Type: application/json" -X POST "localhost:3000/messaging-webhook" -d '{"object": "page", "entry": [{"messaging": [{"message": "TEST_MESSAGE"}]}]}'
 * Expected Response:
 *    200 OK
 */
app.post("/messaging-webhook", (req, res) => {
  let body = req.body;

  console.log(`Received webhook:`);
  console.dir(body, { depth: null });

  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    res.status(200).send("PAGE_EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

/*
* Start the server
*/
const port = config.port;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
