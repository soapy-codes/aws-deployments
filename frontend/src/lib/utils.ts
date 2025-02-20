import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDate(time: number) {
  return new Date(time).toLocaleDateString();
}

export function getTime(time: number) {
  return new Date(time).toLocaleTimeString();
}
