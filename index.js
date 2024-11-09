const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'));

const requestSchema = new mongoose.Schema({
  wardNo: String,
  landmark: String,
  street: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const Request = mongoose.model('Request', requestSchema);

app.post('/api/requests', upload.single('image'), async (req, res) => {
  try {
    const { wardNo, landmark, street } = req.body;
    const result = await cloudinary.uploader.upload(req.file.path);

    const newRequest = new Request({
      wardNo,
      landmark,
      street,
      imageUrl: result.secure_url,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting request' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
