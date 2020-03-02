const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const util = require('util');
const access = util.promisify(require('fs').access);
const exec = util.promisify(require('child_process').exec);
const { zip } = require('zip-a-folder');

async function isRequestValid(serviceAccountPath, bucketURL) {
  if (!serviceAccountPath) {
    return false;
  }

  if (!bucketURL) {
    return false;
  }

  return true;
}

async function isPathAccessible(dir) {
  try {
    const { err } = access(dir);
    if (err) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

async function createTemporaryFolder(dir) {
  try {
    const { stderr } = await exec(`mkdir ${dir}`);

    if (stderr) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

async function runBackupTool(serviceAccountPath, tempFilePath) {
  try {
    const cmd = `npx firestore-backup-restore -a ${serviceAccountPath} -B ${tempFilePath}`;
    const { stdout, stderr } = await exec(cmd, { cwd: __dirname });

    if (stdout.match(/Backing up Document/) && stdout.match(/Restoring to collection/)) {
      return true;
    }

    console.error('stdout: ', stdout);
    console.error('stderr', stderr);
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = async (serviceAccountPath, bucketURL) => {
  if (!isRequestValid(serviceAccountPath, bucketURL)) {
    return { status: true, message: 'Invalid params' };
  }

  const dir = path.join(os.tmpdir(), 'backups');

  if (!await isPathAccessible(dir)) {
    if (!await createTemporaryFolder(dir)) {
      return { status: false, message: 'Error while creating temporary folder' };
    }
  }

  const dateNow = new Date();
  const fileName = dateNow.toISOString();
  const tempFilePath = path.join(dir, fileName);

  if (!await runBackupTool(serviceAccountPath, tempFilePath)) {
    return { status: false, message: 'The backup has failed' };
  }

  const zipFilePath = path.join(dir, `${fileName}.zip`);

  const err = await zip(tempFilePath, zipFilePath);
  if (err) {
    return { status: false, message: `Error while zipping backup directory: ${err}` };
  }

  const serviceAccount = require(serviceAccountPath); //eslint-disable-line

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const bucket = admin.storage().bucket(bucketURL);

  const options = {
    destination: path.join('backups', fileName),
  };

  await bucket.upload(zipFilePath, options);

  return { status: true, message: 'Backup completed and uploaded to storage in backups folder' };
};
