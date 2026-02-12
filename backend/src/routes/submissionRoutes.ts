import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { SubmissionController } from '../controllers/submissionController';

const router = Router();
const uploadDir = path.join(__dirname, '../../uploads/builds');
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
const submissionController = new SubmissionController();

router.post('/android', upload.single('buildFile'), (req, res) => submissionController.submitAndroid(req, res));
router.post('/ios', upload.single('buildFile'), (req, res) => submissionController.submitIOS(req, res));

export default router;
