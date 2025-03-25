import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function for conditionally joining class names together
 * Using clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a visual ID for searching
 * @param visualId - The raw visual ID input
 * @returns Array of possible formats to search for
 */
export function normalizeVisualId(visualId: string): string[] {
  const cleanId = visualId.trim();
  const formats = [
    cleanId,                // Original format 
    cleanId.padStart(4, '0') // Padded to 4 digits if needed
  ];
  
  // If the ID has a prefix like 'INV-', try both with and without
  if (cleanId.includes('-')) {
    const parts = cleanId.split('-');
    if (parts.length === 2) {
      formats.push(parts[1]); // Just the number part
      formats.push(parts[1].padStart(4, '0')); // Padded number part
    }
  } else {
    // If no prefix, try adding common prefixes
    formats.push(`INV-${cleanId}`);
    formats.push(`Q-${cleanId}`);
  }
  
  // Remove duplicates using a filter instead of Set
  return formats.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
}
