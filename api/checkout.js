const { Client, Environment } = require('square');

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production, // Ensure this matches your Vercel keys!
});

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel sometimes parses the body automatically, sometimes not.
    // This line handles both cases securely.
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { items } = body;

    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: Date.now().toString(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: items.map(item => ({
          name: item.name,
          quantity: "1",
          basePriceMoney: {
            // Square requires an integer (BigInt) in cents
            amount: BigInt(Math.round(item.price * 100)),
            currency: 'USD',
          },
        })),
      },
      checkoutOptions: {
        redirectUrl: `https://${req.headers.host}/`,
      }
    });

    return res.status(200).json({ url: result.paymentLink.url });

  } catch (error) {
    console.error("SQUARE API ERROR:", error);
    return res.status(500).json({ 
      error: 'Checkout failed', 
      details: error.message 
    });
  }
};
