const STICKERS = [
  '/assets/stickers/paw-orange.png',
  '/assets/stickers/paw-pink.png',
  '/assets/stickers/bone.png',
  '/assets/stickers/crown.png',
  '/assets/stickers/heart.png',
  '/assets/stickers/star.png',
  '/assets/stickers/bowl.png'
];

function randomStickers(count = 3) {
  const copy = STICKERS.slice();
  const result = [];
  while (result.length < count && copy.length) {
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

module.exports = {
  STICKERS,
  randomStickers
};
