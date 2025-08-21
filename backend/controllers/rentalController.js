import * as RentalCart from '../models/rentalCartModel.js';

export const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await RentalCart.getCartByUserId(userId);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCart = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const updates = req.body;
    await RentalCart.updateCartItem(cartId, updates);
    res.json({ message: 'Cart updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    await RentalCart.deleteCartItem(cartId);
    res.json({ message: 'Cart item removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
