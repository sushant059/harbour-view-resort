/** A gentle wave line twice `width` wide, so sliding it left by `width` loops seamlessly. */
export function wavePath(y: number, half: number, height: number, width = 1440) {
  let d = `M0 ${y}q${half / 2}-${height} ${half} 0`;
  for (let x = half; x < width * 2; x += half) d += `t${half} 0`;
  return d;
}
