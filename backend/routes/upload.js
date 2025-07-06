const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, ValidationError } = require('../middleware/errorHandler');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// Helper function to process and optimize images
const processImage = async (buffer, options = {}) => {
  const {
    width = 1200,
    height = 1200,
    quality = 80,
    format = 'webp'
  } = options;

  let processor = sharp(buffer);

  // Auto-orient based on EXIF data
  processor = processor.rotate();

  // Resize while maintaining aspect ratio
  processor = processor.resize(width, height, {
    fit: 'inside',
    withoutEnlargement: true
  });

  // Convert to specified format and set quality
  switch (format) {
    case 'jpeg':
    case 'jpg':
      processor = processor.jpeg({ quality, progressive: true });
      break;
    case 'png':
      processor = processor.png({ quality, progressive: true });
      break;
    case 'webp':
    default:
      processor = processor.webp({ quality });
      break;
  }

  return processor.toBuffer();
};

// Helper function to generate thumbnail
const generateThumbnail = async (buffer) => {
  return sharp(buffer)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 75 })
    .toBuffer();
};

// Helper function to save file to local storage (or upload to cloud)
const saveFile = async (buffer, filename, uploadsDir) => {
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, buffer);
  
  // In production, you would upload to cloud storage (AWS S3, Google Cloud, etc.)
  // and return the cloud URL instead of local path
  return `/uploads/${filename}`;
};

/**
 * @route POST /api/upload/images
 * @desc Upload multiple images with processing
 * @access Private
 */
router.post('/images', authenticateToken, upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ValidationError('No files uploaded');
  }

  const uploadsDir = await createUploadsDir();
  const uploadedFiles = [];

  try {
    for (const file of req.files) {
      const fileId = uuidv4();
      const timestamp = Date.now();
      
      // Process main image
      const processedImage = await processImage(file.buffer, {
        width: 1200,
        height: 1200,
        quality: 85,
        format: 'webp'
      });
      
      // Generate thumbnail
      const thumbnailBuffer = await generateThumbnail(file.buffer);
      
      // Generate filenames
      const mainFilename = `${fileId}_${timestamp}.webp`;
      const thumbFilename = `${fileId}_${timestamp}_thumb.webp`;
      
      // Save files
      const mainUrl = await saveFile(processedImage, mainFilename, uploadsDir);
      const thumbUrl = await saveFile(thumbnailBuffer, thumbFilename, uploadsDir);
      
      uploadedFiles.push({
        id: fileId,
        original_name: file.originalname,
        main_url: mainUrl,
        thumbnail_url: thumbUrl,
        size: processedImage.length,
        mime_type: 'image/webp',
        uploaded_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      message: 'Images uploaded successfully',
      data: {
        files: uploadedFiles,
        total: uploadedFiles.length
      }
    });

  } catch (error) {
    // Clean up any partially uploaded files
    for (const file of uploadedFiles) {
      try {
        await fs.unlink(path.join(uploadsDir, path.basename(file.main_url)));
        await fs.unlink(path.join(uploadsDir, path.basename(file.thumbnail_url)));
      } catch (cleanupError) {
        console.warn('Failed to cleanup file:', cleanupError.message);
      }
    }
    throw error;
  }
}));

/**
 * @route POST /api/upload/profile-image
 * @desc Upload and process profile image
 * @access Private
 */
router.post('/profile-image', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ValidationError('No image file uploaded');
  }

  const uploadsDir = await createUploadsDir();
  const fileId = uuidv4();
  const timestamp = Date.now();

  try {
    // Process profile image (square crop)
    const processedImage = await processImage(req.file.buffer, {
      width: 500,
      height: 500,
      quality: 90,
      format: 'webp'
    });

    // Generate smaller thumbnail for avatars
    const avatarBuffer = await sharp(req.file.buffer)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate filenames
    const mainFilename = `profile_${req.user.id}_${fileId}_${timestamp}.webp`;
    const avatarFilename = `avatar_${req.user.id}_${fileId}_${timestamp}.webp`;

    // Save files
    const mainUrl = await saveFile(processedImage, mainFilename, uploadsDir);
    const avatarUrl = await saveFile(avatarBuffer, avatarFilename, uploadsDir);

    const uploadedFile = {
      id: fileId,
      original_name: req.file.originalname,
      main_url: mainUrl,
      avatar_url: avatarUrl,
      size: processedImage.length,
      mime_type: 'image/webp',
      uploaded_at: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Profile image uploaded successfully',
      data: { file: uploadedFile }
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    throw error;
  }
}));

/**
 * @route POST /api/upload/item-images
 * @desc Upload images specifically for items/listings
 * @access Private
 */
router.post('/item-images', authenticateToken, upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ValidationError('No files uploaded');
  }

  const { item_id } = req.body;
  if (!item_id) {
    throw new ValidationError('Item ID is required');
  }

  const uploadsDir = await createUploadsDir();
  const uploadedFiles = [];

  try {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileId = uuidv4();
      const timestamp = Date.now();
      
      // Process main image (high quality for item display)
      const processedImage = await processImage(file.buffer, {
        width: 1600,
        height: 1600,
        quality: 90,
        format: 'webp'
      });
      
      // Generate medium size for galleries
      const mediumBuffer = await sharp(file.buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toBuffer();
      
      // Generate thumbnail
      const thumbnailBuffer = await generateThumbnail(file.buffer);
      
      // Generate filenames
      const mainFilename = `item_${item_id}_${fileId}_${timestamp}_main.webp`;
      const mediumFilename = `item_${item_id}_${fileId}_${timestamp}_medium.webp`;
      const thumbFilename = `item_${item_id}_${fileId}_${timestamp}_thumb.webp`;
      
      // Save files
      const mainUrl = await saveFile(processedImage, mainFilename, uploadsDir);
      const mediumUrl = await saveFile(mediumBuffer, mediumFilename, uploadsDir);
      const thumbUrl = await saveFile(thumbnailBuffer, thumbFilename, uploadsDir);
      
      uploadedFiles.push({
        id: fileId,
        original_name: file.originalname,
        main_url: mainUrl,
        medium_url: mediumUrl,
        thumbnail_url: thumbUrl,
        size: processedImage.length,
        mime_type: 'image/webp',
        order: i + 1,
        uploaded_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      message: 'Item images uploaded successfully',
      data: {
        files: uploadedFiles,
        total: uploadedFiles.length,
        item_id
      }
    });

  } catch (error) {
    // Clean up any partially uploaded files
    for (const file of uploadedFiles) {
      try {
        await fs.unlink(path.join(uploadsDir, path.basename(file.main_url)));
        await fs.unlink(path.join(uploadsDir, path.basename(file.medium_url)));
        await fs.unlink(path.join(uploadsDir, path.basename(file.thumbnail_url)));
      } catch (cleanupError) {
        console.warn('Failed to cleanup file:', cleanupError.message);
      }
    }
    throw error;
  }
}));

/**
 * @route DELETE /api/upload/images/:filename
 * @desc Delete an uploaded image
 * @access Private
 */
router.delete('/images/:filename', authenticateToken, asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent directory traversal
  const sanitizedFilename = path.basename(filename);
  if (sanitizedFilename !== filename) {
    throw new ValidationError('Invalid filename');
  }

  const uploadsDir = await createUploadsDir();
  const filePath = path.join(uploadsDir, sanitizedFilename);

  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Delete the file
    await fs.unlink(filePath);
    
    // Try to delete associated thumbnail if it exists
    const thumbPath = filePath.replace(/\.webp$/, '_thumb.webp');
    try {
      await fs.unlink(thumbPath);
    } catch {
      // Thumbnail might not exist, ignore error
    }

    res.json({
      message: 'Image deleted successfully'
    });

  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new ValidationError('File not found');
    }
    throw error;
  }
}));

/**
 * @route GET /api/upload/images/:filename
 * @desc Serve uploaded images
 * @access Public
 */
router.get('/images/:filename', asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent directory traversal
  const sanitizedFilename = path.basename(filename);
  if (sanitizedFilename !== filename) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const uploadsDir = await createUploadsDir();
  const filePath = path.join(uploadsDir, sanitizedFilename);

  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    
    switch (ext) {
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }

    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      'ETag': `"${filename}"`
    });

    // Stream the file
    const fileBuffer = await fs.readFile(filePath);
    res.send(fileBuffer);

  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Image not found' });
    }
    throw error;
  }
}));

/**
 * @route POST /api/upload/validate-image
 * @desc Validate image before upload (check dimensions, file size, etc.)
 * @access Private
 */
router.post('/validate-image', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ValidationError('No image file provided');
  }

  try {
    // Get image metadata
    const metadata = await sharp(req.file.buffer).metadata();
    
    const validation = {
      is_valid: true,
      errors: [],
      warnings: [],
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: req.file.size,
        has_alpha: metadata.hasAlpha,
        density: metadata.density
      }
    };

    // Check minimum dimensions
    if (metadata.width < 300 || metadata.height < 300) {
      validation.errors.push('Image must be at least 300x300 pixels');
      validation.is_valid = false;
    }

    // Check maximum dimensions
    if (metadata.width > 5000 || metadata.height > 5000) {
      validation.errors.push('Image must be smaller than 5000x5000 pixels');
      validation.is_valid = false;
    }

    // Check aspect ratio for profile images
    if (req.body.type === 'profile') {
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio < 0.8 || aspectRatio > 1.2) {
        validation.warnings.push('Profile images work best with square aspect ratio');
      }
    }

    // Check file size
    if (req.file.size > 10 * 1024 * 1024) { // 10MB
      validation.errors.push('File size must be less than 10MB');
      validation.is_valid = false;
    }

    // Suggest optimizations
    if (metadata.format !== 'webp') {
      validation.warnings.push('Converting to WebP format will reduce file size');
    }

    res.json({
      message: 'Image validation completed',
      data: validation
    });

  } catch (error) {
    throw new ValidationError('Invalid image file');
  }
}));

/**
 * @route GET /api/upload/storage-info
 * @desc Get storage usage information for user
 * @access Private
 */
router.get('/storage-info', authenticateToken, asyncHandler(async (req, res) => {
  // This is a simplified implementation
  // In production, you'd track this in the database
  
  const uploadsDir = await createUploadsDir();
  
  try {
    const files = await fs.readdir(uploadsDir);
    const userFiles = files.filter(file => 
      file.includes(`_${req.user.id}_`) || 
      file.includes(`profile_${req.user.id}_`) ||
      file.includes(`avatar_${req.user.id}_`)
    );

    let totalSize = 0;
    for (const file of userFiles) {
      try {
        const stats = await fs.stat(path.join(uploadsDir, file));
        totalSize += stats.size;
      } catch {
        // File might have been deleted, ignore
      }
    }

    const storageLimit = 100 * 1024 * 1024; // 100MB limit per user
    const usagePercentage = (totalSize / storageLimit) * 100;

    res.json({
      message: 'Storage information retrieved successfully',
      data: {
        used_bytes: totalSize,
        used_mb: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        limit_bytes: storageLimit,
        limit_mb: 100,
        usage_percentage: Math.round(usagePercentage * 100) / 100,
        file_count: userFiles.length
      }
    });

  } catch (error) {
    throw error;
  }
}));

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'File too large',
          message: 'File size must be less than 10MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files',
          message: 'Maximum 10 files per upload'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected file field',
          message: 'Invalid file field name'
        });
      default:
        return res.status(400).json({
          error: 'Upload error',
          message: error.message
        });
    }
  }
  next(error);
});

module.exports = router;
