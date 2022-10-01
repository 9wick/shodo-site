export const IsValidUrl = (s: string) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};


export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}