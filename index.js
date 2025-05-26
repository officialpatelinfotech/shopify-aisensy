const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.post("/shopify-webhook", async (req, res) => {
  const checkout = req.body;
  const name = checkout.customer?.first_name || "Customer";
  const amount = checkout.total_price || "0";
  const productUrl = `https://${checkout.shopify_domain}/checkout/${checkout.token}`;
  const imageUrl = checkout.line_items[0]?.image || "https://your-default.jpg";

  let rawPhone = checkout.customer?.phone || "";

  // Remove all non-digit characters (like "+", spaces, dashes)
  let cleanedPhone = rawPhone.replace(/\D/g, "");

  // Ensure it starts with 91 (India country code)
  if (!cleanedPhone.startsWith("91") && cleanedPhone.length === 10) {
    cleanedPhone = "91" + cleanedPhone;
  }

  // Optional: Validate final number format
  if (!/^91\d{10}$/.test(cleanedPhone)) {
    console.error("Invalid phone number format:", rawPhone);
    return res.status(400).send("Invalid phone number");
  }

  const payload = {
    apiKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjhiODEzMzhmMWZlMGMwMDBiYWNiNSIsIm5hbWUiOiJrYXVzaGFseWEgYXJ0IGpld2VsbGVyeSIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2ODI4YjgxMzM4ZjFmZTBjMDAwYmFjYWQiLCJhY3RpdmVQbGFuIjoiRlJFRV9GT1JFVkVSIiwiaWF0IjoxNzQ3NDk5MDI3fQ.x9DHjQf5QO__7qkFt2EHluwqruyyqVbRWk7XpI3NLCI",
    campaignName: "Abandoned Checkout",
    destination: cleanedPhone,
    userName: "Shubham Patel",
    source: "organic",
    templateParams: [name, amount, productUrl],
    media: {
      url: imageUrl,
      filename: "product.jpg",
    },
    buttons: [
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [{ type: "text", text: checkout.token }],
      },
    ],
  };

  try {
    const response = await axios.post(
      "https://backend.aisensy.com/campaign/t1/api/v2",
      payload
    );
    console.log("Message sent:", response.data);
    res.status(200).send("Sent");
  } catch (err) {
    console.error("Failed to send:", err.response?.data || err.message);
    res.status(500).send("Error");
  }
});

app.listen(3000, () => console.log("Middleware running on port 3000"));
