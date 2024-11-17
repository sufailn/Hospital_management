import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'; // Import dotenv here
import morgan from 'morgan'; // Import morgan for logging

// Initialize dotenv
dotenv.config(); // Load environment variables from .env file

// Initialize express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev')); // Logger middleware

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Define Schemas and Models
const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true },
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  phone: { type: String, required: true },
});

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 0 },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);

// Routes for Appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).send(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err); // Log the error for debugging
    res.status(400).send({
      error: err.errors ? Object.values(err.errors).map(e => e.message) : 'Invalid data'
    });
  }
});


app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.send(appointments);
  } catch (err) {
    res.status(500).send(err);
  }
});



app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedAppointment) {
      return res.status(404).send({ message: 'Appointment not found' });
    }

    res.status(200).send(updatedAppointment); // Send updated appointment
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(400).send({ message: 'Error updating appointment', error: err.message });
  }
});


app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return res.status(404).send({ message: 'Appointment not found' });
    }

    res.status(200).send({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).send({ message: 'Error deleting appointment', error: err.message });
  }
});


// Routes for Doctors
app.post('/api/doctors', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).send(doctor);
  } catch (err) {
    console.error('Error while adding doctor:', err); // Log the error
    res.status(400).send({
      error: err.errors ? Object.values(err.errors).map(e => e.message) : 'Invalid data',
    });
  }
});



app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.send(doctors);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(doctor);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Routes for Patients
app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).send(patient);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.send(patients);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(patient);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Start the server
app.listen(3000, () => console.log('Server started on http://localhost:3000'));
