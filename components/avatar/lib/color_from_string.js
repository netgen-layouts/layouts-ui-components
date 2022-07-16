export function colorFromString(str, saturation, lightness) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return `hsl(${h}, ${saturation}%, ${lightness}%)`;
}
