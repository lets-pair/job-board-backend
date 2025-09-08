import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import config from '../config/config';

const s3Config = new S3Client({
  // endpoint: config.s3_bucket_endpoint,
  region: 'us-west-2',
  credentials: {
    accessKeyId: config.s3_access_key,
    secretAccessKey: config.s3_secret_key
  }
});

const uploadS3 = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: config.s3_bucket_name,
    // acl: 'public-read',
    metadata(_req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(_req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

export { uploadS3 };
