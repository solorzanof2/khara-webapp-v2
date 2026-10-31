

export const getRandomGUID = (size: number = 12): string => {
  const charsCollection = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = charsCollection.length;

  let hash = '';
  let index = 0;
  for (index; index < size; index++) {
    hash += charsCollection[Math.floor(Math.random() * charsLength)];
  }

  return hash;
}
