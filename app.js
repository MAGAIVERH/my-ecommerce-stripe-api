require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_API_KEY);
const express = require("express");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: "https://club-clothing.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type"],
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Enable preflight requests for all routes
app.options('*', cors(corsOptions));
app.use(express.json());

const PAYMENT_CONFIRMATION_URL = `${process.env.FRONT_END_URL}/payment-confirmation`;

app.post("/create-checkout-session", async (req, res) => {
  console.log(req.body); 
  const items = req.body.products.map((product) => ({
    price_data: {
      currency: "brl",
      product_data: {
        name: product.name,
      },
      unit_amount: parseInt(`${product.price}00`),
    },
    quantity: product.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: items,
    mode: "payment",
    success_url: `${PAYMENT_CONFIRMATION_URL}?success=true`,
    cancel_url: `${PAYMENT_CONFIRMATION_URL}?canceled=true`,
  });

  res.send({ url: session.url });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;  
  app.listen(PORT, () => console.log(`Running on port ${PORT}`));
}

module.exports = app;
