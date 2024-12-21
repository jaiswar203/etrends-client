import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dateToHumanReadable(date: Date | string) {
  return new Date(date).toLocaleDateString();
}

// create a function which takes whole string and capitalize first letter of each word
export function capitalizeFirstLetter(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
