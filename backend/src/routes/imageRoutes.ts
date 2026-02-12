import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { ImageController } from '../controllers/imageController';

const router = Router();
const uploadDir = path.join(__dirname, '../../uploads/temp');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
const imageController = new ImageController();

router.post('/icons', upload.single('image'), (req, res) => imageController.processIcons(req, res));
router.post('/frame', upload.single('screenshot'), (req, res) => imageController.frameScreenshot(req, res));

export default router;
