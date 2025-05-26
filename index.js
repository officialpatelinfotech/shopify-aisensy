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

    const payload = {
        apiKey: "your-api-key",
        campaignName: "Abandoned Checkout",
        destination: `91${checkout.customer.phone}`,
        userName: "Shubham Patel",
        source: "organic",
        templateParams: [name, amount, productUrl],
        media: {
            url: imageUrl,
            filename: "product.jpg"
        },
        buttons: [
            {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                    { type: "text", text: checkout.token }
                ]
            }
        ]
    };

    try {
        const response = await axios.post("https://backend.aisensy.com/campaign/t1/api/v2", payload);
        console.log("Message sent:", response.data);
        res.status(200).send("Sent");
    } catch (err) {
        console.error("Failed to send:", err.response?.data || err.message);
        res.status(500).send("Error");
    }
});

app.listen(3000, () => console.log("Middleware running on port 3000"));
