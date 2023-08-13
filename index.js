require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB setup
mongoose.connect(process.env.MONGO_URL, {
// mongoose.connect('mongodb://127.0.0.1:27017/gofundme01', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Mongoose schema and model
const campaignSchema = new mongoose.Schema({
  title: String,
  description: String,
  goalAmount: Number,
  currentAmount: Number,
});

const Campaign = mongoose.model('Campaign', campaignSchema);

// Create a new campaign
app.post('/api/campaigns', async (req, res) => {
  const { title, description, goalAmount } = req.body;
  try {
    const newCampaign = new Campaign({
      title,
      description,
      goalAmount,
      currentAmount: 14200,
    });
    await newCampaign.save();
    res.json(newCampaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating campaign' });
  }
});

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
});

// Handle donation
// Handle incrementing currentAmount after successful payment
app.post('/api/increment/:id', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.currentAmount += amount;
    await campaign.save();

    res.json({
      campaignId: campaign._id,
      amount: campaign.currentAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error incrementing currentAmount' });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
