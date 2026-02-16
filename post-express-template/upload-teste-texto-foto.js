require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadTeste() {
  console.log('☁️  Upload imagem texto + foto...\n');

  const filePath = path.join(__dirname, 'teste-texto-foto/teste-texto-foto.png');

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'post-express/teste',
    public_id: 'teste-texto-foto',
    overwrite: true,
    resource_type: 'image'
  });

  console.log('✅ Upload concluído!\n');
  console.log('🔗 URL da imagem:\n');
  console.log(result.secure_url);
  console.log('\n💡 Abra o link para ver!\n');
}

uploadTeste().catch(console.error);
