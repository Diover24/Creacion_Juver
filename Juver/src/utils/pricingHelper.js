// src/utils/pricingHelper.js

const BASE_FARE = 3500;
const PRICE_PER_KM = 1200;
const PRICE_PER_MINUTE = 200;

/**
 * Calculates the total fare for a trip based on distance and time.
 * @param {number} distanceInKm - The total distance of the trip in kilometers.
 * @param {number} timeInMinutes - The estimated time of the trip in minutes.
 * @returns {number} The calculated total fare rounded to the nearest integer.
 */
export const calculateTripFare = (distanceInKm, timeInMinutes) => {
  if (!distanceInKm || !timeInMinutes) return 0;

  const distanceCost = distanceInKm * PRICE_PER_KM;
  const timeCost = timeInMinutes * PRICE_PER_MINUTE;
  
  const totalFare = BASE_FARE + distanceCost + timeCost;
  
  return Math.round(totalFare);
};