const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 5006;

const url = 'mongodb://localhost:27017/'; // MongoDB connection string
const dbName = 'MedReady'; // Database name

let db;
let patientsCollection;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    patientsCollection = db.collection('Patients');
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Get patient profile by username
app.get('/api/patient/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const patient = await patientsCollection.findOne({ username });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Return the patient data
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Error fetching patient data' });
  }
});

// Update patient profile
app.put('/api/patient/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { report } = req.body;

    // Validate the input data
    if (!report) {
      return res.status(400).json({ message: 'Report data is required' });
    }

    const updateFields = {
      report: {
        blood_group: report.blood_group,
        weight: report.weight,
        age: report.age,
        address: report.address,
        phone: report.phone,
        email: report.email,
        medical_conditions: report.medical_conditions,
      },
    };

    const result = await patientsCollection.updateOne(
      { username },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Patient not found or no changes made' });
    }

    // Fetch and return the updated patient data
    const updatedPatient = await patientsCollection.findOne({ username });
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient data:', error);
    res.status(500).json({ message: 'Error updating patient data' });
  }
});

// Serve static files if necessary
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
  console.log(`Patient Server is running on http://localhost:${port}`);
});