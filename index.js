const express = require("express");
const axios = require("axios");
const app = express();
require("dotenv").config();

app.use(express.json());

app.post("/shopify-webhook", async (req, res) => {
  const order = req.body;

  try {
    await axios.post("https://backend.aisensy.com/campaign/t1/api/v2", {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: "shopify_abandoned_checkout",
      destination: order.phone || order.customer?.phone,
      userName: order.customer?.first_name,
      source: "Shopify",
      templateParams: [order.name, order.total_price],
      tags: ["shopify"],
      attributes: { order_id: String(order.id) }
    });

    res.status(200).send("Sent to AiSensy");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Failed");
  }
});

app.listen(3000, () => console.log("Listening on port 3000"));
