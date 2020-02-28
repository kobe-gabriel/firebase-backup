const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const zipFolder = require('zip-folder');

exports.runBackup = (serviceAccountPath, bucketURL) => {
  if (!serviceAccountPath) {
    return { status: false, message: 'Service Account JSON path not provided' };
  }

  if (!bucketURL) {
    return { status: false, message: 'Bucket URL not provided' };
  }

  const dir = path.join(os.tmpdir(), 'backups');

  fs.stat(dir, (err) => {
    if (err) {
      exec(`mkdir ${dir}`, (err) => {
        if (err) {
          return { status: false, message: `Error while creating temporary folder: ${err}` };
        }
      });
    }
  });

  const dateNow = new Date();
  const fileName = dateNow.toISOString();

  const tempFilePath = path.join(dir, fileName);

  exec(`firestore-backup-restore -a ${serviceAccountPath} -B ${tempFilePath}`, (err) => {
    if (err) {
      return { status: false, message: `The backup has failed: ${err}` };
    }

    const zipFilePath = path.join(dir, `${fileName}.zip`);

    zipFolder(tempFilePath, zipFilePath, (err) => {
      if (err) {
        return { status: false, message: `Error while zipping backup directory: ${err}` };
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });

      const bucket = admin.storage().bucket(bucketURL);

      bucket.upload(zipFilePath, {
        destination: path.join('backups', fileName),
      })
        .then(() => ({ status: true, message: 'Backup completed and uploaded to storage in backups folder' }))
        .catch((err) => ({ status: false, message: `Error while uploading to storage: ${err}` }));
    });
  });
};
