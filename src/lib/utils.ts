import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date as DD-MM-YYYY (e.g., 16-01-2026)
export function formatDateDMY(date?: string | null) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// Format labels: handles underscores, camelCase, and capitalizes each word
// Examples: "pending_approval" → "Pending Approval", "activeStatus" → "Active Status"
export function formatLabel(text: string): string {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')  // Replace underscores with spaces
    .replace(/([A-Z])/g, ' $1')  // Add space before capital letters (camelCase)
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
