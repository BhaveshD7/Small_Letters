const Subscriber = require('../models/Subscriber');
const { sendWelcomeEmail } = require('../config/email');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email required' });
    }

    const existing = await Subscriber.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }

    const subscriber = await Subscriber.create({ email });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email).catch(err => console.error('Email error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully',
      subscriber,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll();
    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    await Subscriber.unsubscribe(email);
    res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { subscribe, getSubscribers, unsubscribe };
