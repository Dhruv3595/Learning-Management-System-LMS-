import path from "path";
import multer from "multer";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500 mb in size max limit
    fieldSize: 25 * 1024 * 1024, // 25MB field size limit
    fields: 100, // Max number of non-file fields
    files: 10 // Max number of files
  },
  fileFilter: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    
    // Allowed image extensions
    const allowedImageExts = [".jpg", ".jpeg", ".webp", ".png"];
    
    // Allowed video extensions  
    const allowedVideoExts = [".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".webm"];
    
    if (!allowedImageExts.includes(ext) && !allowedVideoExts.includes(ext)) {
      cb(new Error(`Unsupported file type! ${ext}. Allowed formats: Images (${allowedImageExts.join(', ')}) and Videos (${allowedVideoExts.join(', ')})`), false);
      return;
    }
    
    cb(null, true);
  },
});

export default upload;
