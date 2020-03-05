# firebase-backup-collections

This module was created as a dynamic solution to generate a backup of all collections from your firestore. It depends on [firestore-backup-restore](https://github.com/user/repo/blob/branch/other_file.md), which runs on terminal and runs all the backup process related. The **firebase-backup-collections** only turns this library easier to use.

After the collections download is completed, it will zip the content and name it with the current ISO Date so you can keep control of when it was uploaded. You can check the files inside backup directory that will be created on your Firebase Storage.

### Usage
```
const backupTool = require('firebase-backup-collections');
(async () => {
  const result = await backupTool('/absolute/path/to/your/service/account/json/file.json', 'your-bucket-url.com');
})();

# Success return example
{ status: true, message: 'Backup completed and uploaded to storage in backups folder' }

# Error return example
{ status: false, message: 'The backup has failed' }
```