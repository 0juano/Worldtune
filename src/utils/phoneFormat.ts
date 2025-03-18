import {
  parsePhoneNumberFromString,
  AsYouType,
  CountryCode
} from 'libphonenumber-js';

/**
 * The international phone formatter utility provides functions to format phone numbers
 * according to international standards of different countries.
 */

/**
 * Format a phone number input to international format based on detected country pattern
 * @param input - The phone number input from the user
 * @returns - The formatted international phone number
 */
export const formatInternationalPhoneNumber = (input: string): string => {
  // If input is empty, return empty string
  if (!input) return '';

  // Ensure we start with a '+' for international format
  const inputWithPlus = input.startsWith('+') ? input : `+${input}`;
  
  // Use AsYouType formatter which formats numbers as they are typed
  // No try/catch needed here as AsYouType doesn't throw errors on invalid input
  return new AsYouType().input(inputWithPlus);
};

/**
 * Detects the country code from a phone number input
 * @param input - The phone number input
 * @returns - The detected country code or null if not detectable
 */
export const detectCountryFromNumber = (input: string): CountryCode | null => {
  // Ensure we have a '+' for international parsing
  const inputWithPlus = input.startsWith('+') ? input : `+${input}`;
  
  const phoneNumber = parsePhoneNumberFromString(inputWithPlus);
  return phoneNumber?.country || null;
};

/**
 * Validates a phone number against country-specific rules
 * @param input - The phone number to validate
 * @returns - Whether the number is valid according to its country format
 */
export const validatePhoneNumber = (input: string): boolean => {
  // Empty input is considered invalid
  if (!input) return false;
  
  // Ensure we have a '+' for international parsing
  const inputWithPlus = input.startsWith('+') ? input : `+${input}`;
  
  const phoneNumber = parsePhoneNumberFromString(inputWithPlus);
  return phoneNumber?.isValid() || false;
};

/**
 * Formats a number in the E.164 format for API calls
 * @param input - The user-entered phone number
 * @returns - The E.164 formatted number (e.g., +12125551234)
 */
export const formatE164 = (input: string): string => {
  if (!input) return '';
  
  const inputWithPlus = input.startsWith('+') ? input : `+${input}`;
  
  const phoneNumber = parsePhoneNumberFromString(inputWithPlus);
  return phoneNumber?.format('E.164') || inputWithPlus;
}; 