// Sabit erişim kodunun SHA-256 özeti (sha256(ACCESS_SALT + KOD), KOD büyük harf, - ve boşluksuz).
// Kodun kendisi kodda YOK. Kodu değiştirmek için yeni özeti hesaplayıp aşağıya yazın:
//   node -e "console.log(require('crypto').createHash('sha256').update('SALT'+'KODUNUZ').digest('hex'))"
export const ACCESS_SALT = 'ade7b6e3ff686672';
// Her kod için erişim süresi (gün) ayrı tutulur.
export const ACCESS_CODES: { hash: string; days: number }[] = [
  { hash: '17d1acfca1d6244b9aafb0f5aa9d830830224e55c92e1ef06c6aadd3738306ff', days: 30 },
  { hash: 'f146c7b17932c4014e4086cf9b7f09093573b3f18f1d0d9df97763c0283bd412', days: 12 },
];
