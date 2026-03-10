const { Client, Environment } = require('square');

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production, // Change to Environment.Production when going live
});

module.exports = async (req, res) => {
  // 1. Set headers for Cross-Origin (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request for browsers
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
    console.error("SQUARE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};
