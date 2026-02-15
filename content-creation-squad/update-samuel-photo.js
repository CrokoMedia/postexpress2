#!/usr/bin/env node

/**
 * 🖼️ ATUALIZADOR DE FOTO DO SAMUEL
 * Atualiza a foto de perfil no conversor
 */

// URL da foto de perfil do Samuel
// Para pegar: acesse instagram.com/samuelfialhoo, clique com botão direito
// na foto de perfil, "Abrir imagem em nova aba", copie a URL

const SAMUEL_PROFILE_PIC = 'https://instagram.fcgh8-1.fna.fbcdn.net/v/t51.2885-19/469489466_602726122376870_7934686901629894953_n.jpg?stp=dst-jpg_s150x150&_nc_ht=instagram.fcgh8-1.fna.fbcdn.net&_nc_cat=103&_nc_ohc=4uK2Y0xOWYEQ7kNvgGi_S7k&_nc_gid=b81cd4a06a5e496e8fb84c3d2c476ba5&edm=AEhyXUkBAAAA&ccb=7-5&oh=00_AYBbQJNFQ4F5sY7z5DRZLLcqWmVy8y9R5fHdBbOh2sqmxA&oe=67562A43&_nc_sid=8f1549';

// Ou use um placeholder profissional
const PLACEHOLDER_PHOTO = 'SF'; // Iniciais do Samuel Fialho

console.log(`
🖼️  FOTO DE PERFIL DO SAMUEL

Para atualizar a foto, edite o arquivo:
convert-squad-to-images.js

Linha 12-17, mude de:

const SAMUEL_DATA = {
  name: 'Samuel Fialho',
  handle: '@samuelfialhoo',
  isVerified: true,
  profilePic: '🔥',
};

Para:

const SAMUEL_DATA = {
  name: 'Samuel Fialho',
  handle: '@samuelfialhoo',
  isVerified: true,
  profilePic: '${SAMUEL_PROFILE_PIC}',
};

Depois execute:
node convert-squad-to-images.js

Isso vai regerá todos os slides com a foto real!
`);

export { SAMUEL_PROFILE_PIC, PLACEHOLDER_PHOTO };
