import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from './routes/authRoutes.js';
import vehicleRoute from './routes/vehicleRoute.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import tripDetailsRoutes from './routes/tripDetailsRoutes.js';
import userRoutes from './routes/userRoute.js';
import paymentRoute from './routes/paymentRoute.js';

dotenv.config()

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5178',
  credentials: true
}));

app.use('/api', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/vehicle', vehicleRoute);
app.use('/api/review', reviewRoutes);
app.use('/api/trip', tripDetailsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});