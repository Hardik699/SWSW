import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function convertNumberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Lakh", "Crore"];

  if (num === 0) return "Zero";

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num % 1) * 100);

  let result = "";
  let scaleIndex = 0;

  const convertHundreds = (n: number): string => {
    let words = "";
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundred > 0) {
      words += ones[hundred] + " Hundred";
    }

    if (remainder >= 10 && remainder < 20) {
      if (words) words += " ";
      words += teens[remainder - 10];
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;

      if (ten > 0) {
        if (words) words += " ";
        words += tens[ten];
      }

      if (one > 0) {
        if (words) words += " ";
        words += ones[one];
      }
    }

    return words;
  };

  let temp = integerPart;
  while (temp > 0) {
    let chunk = temp % 100;
    if (scaleIndex === 0) {
      chunk = temp % 1000;
    }

    if (chunk !== 0) {
      const chunkWords = convertHundreds(chunk);
      if (result) result = chunkWords + " " + scales[scaleIndex] + " " + result;
      else result = chunkWords + (scales[scaleIndex] ? " " + scales[scaleIndex] : "");
    }

    if (scaleIndex === 0) {
      temp = Math.floor(temp / 1000);
    } else {
      temp = Math.floor(temp / 100);
    }
    scaleIndex++;
  }

  if (decimalPart > 0) {
    result += " and " + decimalPart + " Paise";
  }

  return result.trim() + " Rupees only";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
