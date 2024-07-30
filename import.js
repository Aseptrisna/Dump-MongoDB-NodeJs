const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');

// Konfigurasi untuk database tujuan
const targetUri = 'mongodb://localhost:27017/georima-peta';
const inputDir = path.join(__dirname, 'backup/potensi'); 

async function importCollections() {
  console.log('Menghubungkan ke MongoDB tujuan...');
  // Koneksi ke MongoDB tujuan
  await mongoose.connect(targetUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Berhasil terhubung ke MongoDB tujuan');

  // Mendapatkan daftar file JSON di direktori input
  const files = await fs.readdir(inputDir);

  for (const file of files) {
    if (path.extname(file) === '.json') {
      const collectionName = path.basename(file, '.json');
      console.log(`Mengimpor koleksi: ${collectionName}`);
      const data = await fs.readJson(path.join(inputDir, file));
      const collection = mongoose.connection.db.collection(collectionName);

      if (data.length > 0) {
        await collection.insertMany(data);
        console.log(`Berhasil mengimpor ${data.length} dokumen ke koleksi ${collectionName}`);
      } else {
        console.log(`Tidak ada dokumen untuk diimpor ke koleksi ${collectionName}`);
      }
    }
  }

  console.log('Semua koleksi telah diimpor.');
  await mongoose.connection.close();
  console.log('Koneksi MongoDB tujuan ditutup.');
}

importCollections().catch(err => {
  console.error('Terjadi kesalahan:', err);
  mongoose.connection.close();
});
