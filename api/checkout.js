const { Client, Environment } = require('square');

// Initialize the Square Client
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production, // Change to Environment.Production when you are ready for real money
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the cart items from the request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { items } = body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create the Payment Link
    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: Date.now().toString(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: items.map(item => ({
          name: item.name,
          quantity: "1",
          basePriceMoney: {
            // Square expects cents. We use BigInt to prevent precision errors.
            amount: BigInt(Math.round(item.price * 100)), 
            currency: 'USD',
          },
        })),
      },
      checkoutOptions: {
        allowTipping: false,
        redirectUrl: `https://${req.headers.host}/`, // Sends user back to your site after payment
      }
    });

    // Return the URL to the frontend
    return res.status(200).json({ url: result.paymentLink.url });

  } catch (error) {
    console.error("SQUARE API ERROR:", error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
}
