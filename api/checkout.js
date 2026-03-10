const { Client, Environment } = require('square');

// Initialize Square Client
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN, // Hidden Environment Variable
  environment: Environment.Sandbox, // Change to Production when ready
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { items } = JSON.parse(req.body);

    // Create a Checkout Link
    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: Date.now().toString(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: items.map(item => ({
          name: item.name,
          quantity: "1",
          basePriceMoney: {
            amount: item.price * 100, // Square uses cents (8500 = $85.00)
            currency: 'USD',
          },
        })),
      },
    });

    // Send the Square URL back to your website
    res.status(200).json({ url: response.result.paymentLink.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create checkout" });
  }
}
