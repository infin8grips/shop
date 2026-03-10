const { Client, Environment } = require('square');

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, 
});

module.exports = async (req, res) => {
  // --- ADD THIS CORS SECTION ---
  // Replace '*' with 'https://www.infin8grips.com' for maximum security later
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- END CORS SECTION ---

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
    });

    return res.status(200).json({ url: result.paymentLink.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
