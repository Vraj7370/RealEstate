const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const streamifier = require('streamifier');

// ─── Configure Cloudinary ─────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer — memory storage (no disk writes) ─────────────
// Files are stored in memory as Buffer, then streamed to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed'), false);
  }
};

// Single file upload (profile pic)
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('profilePic');

// Multiple files upload (property images — max 10)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per image
}).array('images', 10);

// ─── Upload buffer to Cloudinary via stream ───────────────
const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: options.transformation || [],
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ─── Delete image from Cloudinary by public_id ────────────
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
};

// ─── Extract public_id from Cloudinary URL ────────────────
// e.g. https://res.cloudinary.com/mycloud/image/upload/v123/propfinder/profiles/abc123.jpg
//  → propfinder/profiles/abc123
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary')) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    // skip version segment (v12345)
    const startIndex = uploadIndex + 2;
    const pathWithExt = parts.slice(startIndex).join('/');
    return pathWithExt.replace(/\.[^/.]+$/, ''); // remove extension
  } catch {
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
};
