const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');

// Konfigurasi
const uri = 'mongodb://georima-map:mltYSZ2Vvc1tYXA@database2.pptik.id:27017/georima-map';
// const dbName = 'georima-map';
const outputDir = path.join(__dirname, 'backup/potensi');

async function exportCollections() {
  console.log('Memastikan direktori output ada...');
  // Buat direktori output jika belum ada
  await fs.ensureDir(outputDir);

  console.log('Menghubungkan ke MongoDB...');
  // Koneksi ke MongoDB
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Berhasil terhubung ke MongoDB');

  // Mendapatkan daftar koleksi
  const db = mongoose.connection.db;
  console.log('Mengambil daftar koleksi...');
  const collections = await db.listCollections().toArray();
  console.log(`Ditemukan ${collections.length} koleksi.`);

  for (const collectionInfo of collections) {
    const collectionName = collectionInfo.name;
    console.log(`Mengekspor koleksi: ${collectionName}`);
    const collection = db.collection(collectionName);
    const data = await collection.find().toArray();
    console.log(`Ditemukan ${data.length} dokumen di koleksi ${collectionName}`);

    const filePath = path.join(outputDir, `${collectionName}.json`);
    await fs.writeJson(filePath, data, { spaces: 2 });

    console.log(`Koleksi ${collectionName} diekspor ke ${filePath}`);
  }

  console.log('Semua koleksi telah diekspor.');
  await mongoose.connection.close();
  console.log('Koneksi MongoDB ditutup.');
}

exportCollections().catch(err => {
  console.error('Terjadi kesalahan:', err);
  mongoose.connection.close();
});
