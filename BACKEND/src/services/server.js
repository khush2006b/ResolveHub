// import 'dotenv/config'
// import express from 'express'
// import mongoose from 'mongoose'
// import authRoutes from './src/routes/auth.js'
// import complaintRoutes from './src/routes/complaints.js'
// import adminRoutes from './src/routes/admin.js'
// import cors from 'cors'
// const app = express();

// // Database connection
// const connectDB = async() => {
//     try{
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log('MongoDB connected successfully');
//     }
//     catch(err){
//         console.error('MongoDB connection error : ', err.message);
//         process.exit(1);
//     }
// };

// connectDB();

// const allowedOrigins = [
//     'http://localhost:5173', 
//      'http://127.0.0.1:5173',
// ];
// const corsOptions = {
//   origin: allowedOrigins,
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true, // Allow cookies and authentication headers (JWT)
// };
// app.use(cors(corsOptions));
// app.use(express.json());

// //Define routes
// app.use('/api/auth', authRoutes);
// app.use('/api/complaints', complaintRoutes);
// app.use('/api/admin', adminRoutes);
// // Root route
// app.get('/', (req, res) => 
//     res.send("ResolveHub is running...")
// );

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server started on ${PORT}.`))


import express from 'express';
import cors from 'cors';
import path from 'path';
// import { fileURLToPath } from 'url';
import { fileURLToPath } from 'url';
import { dirname } from 'path'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());

const modelDir = path.join(__dirname, 'mobilenet_model');
app.use('/model', express.static(modelDir));

app.listen(PORT, () => {
    console.log(`\nModel server running at http://localhost:${PORT}/model`);
    console.log(`Serving files from: ${modelDir}`);
    console.log('You can now run your train.js script in a separate terminal.');
});