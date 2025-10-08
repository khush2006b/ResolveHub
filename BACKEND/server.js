import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './src/routes/auth.js'
import complaintRoutes from './src/routes/complaints.js'
import adminRoutes from './src/routes/admin.js'
import cors from 'cors'
const app = express();

// Database connection
const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    }
    catch(err){
        console.error('MongoDB connection error : ', err.message);
        process.exit(1);
    }
};

connectDB();

const allowedOrigins = [
    'http://localhost:5173', 
     'http://127.0.0.1:5173',
];
const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and authentication headers (JWT)
};
app.use(cors(corsOptions));
app.use(express.json());

//Define routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
// Root route
app.get('/', (req, res) => 
    res.send("ResolveHub is running...")
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}.`))