const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataStore = require('../config/dataStore');
const nodemailer = require('nodemailer');

// Helper to simulate and send automated alerts
async function triggerAdminAlert(lead, property) {
  const border = '==================================================';
  const alertText = `
${border}
🚨 NEW CUSTOMER LEAD SUBMISSION ALERT!
${border}
Client Name:    ${lead.name}
Client Email:   ${lead.email || 'Not Provided'}
Client Phone:   ${lead.phone}
Inquiry Time:   ${new Date(lead.createdAt || Date.now()).toLocaleString()}
Message:
"${lead.message}"

${property ? `Regarding Property:
------------------
Title:          ${property.title} / ${property.titleEn}
Block:          ${property.block}
Plot Size:      ${property.plotSize} Katha
Facing:         ${property.facing}
Status:         ${property.status}
Price:          ${property.price ? `${property.price} BDT` : 'Contact for Price'}` : 'Regarding: General corporate inquiry / consultation'}
${border}
`;
  console.log(alertText);

  // Send real email if SMTP credentials are provided in environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.ADMIN_EMAIL) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: `"Bashatbari Alert" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🚨 New Lead: ${lead.name} - ${lead.phone}`,
        text: alertText
      };

      await transporter.sendMail(mailOptions);
      console.log('✉️ Automated admin alert email dispatched successfully.');
    } catch (err) {
      console.error('❌ Failed to dispatch automated alert email. Reason:', err.message);
    }
  } else {
    console.log('ℹ️ SMTP settings not configured. Admin alert email not sent (printed to console logs).');
  }
}

// @route   POST api/leads
// @desc    Submit a lead / contact inquiry
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, phone, message, propertyId } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const lead = await dataStore.createLead({
      name,
      email: email || '',
      phone,
      message,
      propertyId: propertyId || null,
      status: 'New'
    });

    // Populate property for full alert context
    let relatedProperty = null;
    if (propertyId) {
      relatedProperty = await dataStore.getPropertyById(propertyId);
    }

    // Trigger alerts async
    triggerAdminAlert(lead, relatedProperty);

    res.json({ success: true, message: 'Inquiry submitted successfully', lead });
  } catch (err) {
    console.error('Error submitting lead:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads
// @desc    Get all leads
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const leads = await dataStore.getAllLeads();
    res.json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/leads/:id
// @desc    Update a lead status
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const updatedLead = await dataStore.updateLead(req.params.id, { status });
    if (!updatedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(updatedLead);
  } catch (err) {
    console.error(`Error updating lead ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/stats
// @desc    Get admin statistics
// @access  Private (Admin)
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await dataStore.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
