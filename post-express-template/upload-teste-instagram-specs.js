require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadTeste() {
  console.log('☁️  Upload teste Instagram specs...\n');

  const filePath = path.join(__dirname, 'teste-instagram-specs/teste-instagram-specs.png');

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'post-express/teste',
    public_id: 'teste-instagram-specs',
    overwrite: true,
    resource_type: 'image'
  });

  console.log('✅ Upload concluído!\n');
  console.log('🔗 URL:\n');
  console.log(result.secure_url);
  console.log('\n');
}

uploadTeste().catch(console.error);
