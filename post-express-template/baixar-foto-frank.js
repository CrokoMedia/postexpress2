/**
 * Baixar foto do Frank Costa do Instagram
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const fotoUrl = 'https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/573331585_18537652141006419_1408263326610028077_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDAuYzIifQ&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QHjq8XcsBMHZPenWVJIkJ8DvkbtfDQMzMUlYfg1R2OlNapfylnz7G1YQK3Sj0kcvdI&_nc_ohc=Fwvzhat94I0Q7kNvwHZrfYt&_nc_gid=oCcvqqI2k7anRG_EGA6R5w&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfsIt1zUNu77QizDtAiRBIQqkG5TzxCIAc7F4PceOs1lMQ&oe=6998BA73&_nc_sid=8b3546';

const outputPath = path.join(__dirname, 'frank-foto.jpg');

console.log('📥 Baixando foto do Frank Costa...\n');

const file = fs.createWriteStream(outputPath);

https.get(fotoUrl, (response) => {
  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('✅ Foto baixada com sucesso!\n');
    console.log(`📁 Salvo em: ${outputPath}\n`);

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`📊 Tamanho: ${sizeKB} KB\n`);
  });
}).on('error', (err) => {
  fs.unlink(outputPath, () => {});
  console.error('❌ Erro ao baixar:', err.message);
});
