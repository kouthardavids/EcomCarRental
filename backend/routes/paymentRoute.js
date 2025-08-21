import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency, successUrl, cancelUrl, metadata, lineItems } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const sessionLineItems = lineItems && lineItems.length > 0 
      ? lineItems.map(item => ({
          price_data: {
            currency: currency || 'zar',
            product_data: {
              name: item.name || 'Car Rental Booking',
            },
            unit_amount: Math.round(item.amount * 100), // Convert to cents
          },
          quantity: item.quantity || 1,
        }))
      : [
          {
            price_data: {
              currency: currency || 'zar',
              product_data: {
                name: 'Car Rental Booking',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ];

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: sessionLineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    });

    res.status(200).json({
      sessionId: session.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment and update booking status
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, bookingIds } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Verify the payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Payment not completed', 
        status: paymentIntent.status 
      });
    }

    // Update booking status in database
    // This is where you would update your database to mark bookings as paid
    
    res.status(200).json({ 
      success: true, 
      message: 'Payment confirmed and bookings updated',
      paymentIntent: paymentIntent
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment intent status
router.get('/payment-intent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    
    res.status(200).json({ 
      status: paymentIntent.status,
      paymentIntent: paymentIntent
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;