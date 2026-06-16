import { isValidColorName, isValidHSL, isValidRGB } from "is-valid-css-color";


export const isValidColor = (color: string) => {
  return isValidColorName(color) || isValidHSL(color) || isValidRGB(color);
};