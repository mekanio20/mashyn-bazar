// Sabit erişim kodunun SHA-256 özeti (sha256(ACCESS_SALT + KOD), KOD büyük harf, - ve boşluksuz).
// Kodun kendisi kodda YOK. Kodu değiştirmek için yeni özeti hesaplayıp aşağıya yazın:
//   node -e "console.log(require('crypto').createHash('sha256').update('SALT'+'KODUNUZ').digest('hex'))"
export const ACCESS_SALT = 'ade7b6e3ff686672';
export const ACCESS_HASHES: string[] = ['17d1acfca1d6244b9aafb0f5aa9d830830224e55c92e1ef06c6aadd3738306ff'];
