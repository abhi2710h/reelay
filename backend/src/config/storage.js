const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'reelay/reels',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mov'],
    transformation: [{ quality: 'auto' }],
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req) => ({
    folder: 'reelay/' + (req.uploadFolder || 'avatars'),
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  }),
});

const storyStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'reelay/stories',
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
    allowed_formats: ['mp4', 'webm', 'mov', 'jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto' }],
  }),
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const storyUpload = multer({
  storage: storyStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    cb(null, allowed.includes(file.mimetype));
  },
});

module.exports = { videoUpload, imageUpload, storyUpload, cloudinary };
