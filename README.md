# firebase-backup-collections

This module was created as a dynamic solution to generate a backup of all collections from your firestore. It depends on [firestore-backup-restore](https://github.com/user/repo/blob/branch/other_file.md), which runs on terminal and runs all the backup process related. The **firebase-backup-collections** only turns this library easier to use.

After the collections download is completed, it will zip the content and name it with the current ISO Date so you can keep control of when it was uploaded. You can check the files inside backup directory that will be created on your Firebase Storage.

### Updates version 2.0.0
A new feature was implemented to define the maximum backup files that you want to keep in the storage. <br/>
It's an optional parameter, with the default 0, which means that nothing will change from the previous version. If you want to use this feature, just pass a third parameter with the limit, and the oldest one will be removed, sorted by date.

Also added some logs during all the process.

### Usage
```
const backupTool = require('firebase-backup-collections');
(async () => {
  // Without backup files limit
  const result = await backupTool('/absolute/path/to/your/service/account/json/file.json', 'your-bucket-url.com');

  // With backup files limit
  const result = await backupTool('/absolute/path/to/your/service/account/json/file.json', 'your-bucket-url.com', 7);
})();

# Success return example
{ status: true, message: 'Backup completed and uploaded to storage in backups folder' }

# Error return example
{ status: false, message: 'The backup has failed' }
```