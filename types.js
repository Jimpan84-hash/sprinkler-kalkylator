// This file defines the data structures for the application using JSDoc comments.
// It helps with code completion and understanding the shape of the data,
// without needing a full TypeScript setup.

/**
 * @typedef {'vecko' | 'manad' | 'kvartal' | 'halvar' | 'helar'} IntervalKey
 */

/**
 * @typedef {object} Task
 * @property {string} id
 * @property {string} name
 * @property {number} baseHours
 */

/**
 * @typedef {Task & { currentHours: number }} QuoteTask
 */

/**
 * @typedef {object} CustomerInfo
 * @property {string} name
 * @property {string} facility
 * @property {string} address
 * @property {string} contact
 */

/**
 * @typedef {object} Multipliers
 * @property {number} larmventilerVat
 * @property {number} larmventilerTorr
 * @property {number} dieselpumpar
 * @property {number} flodesvakter
 * @property {number} sprinklercentraler
 */

/**
 * @typedef {object} QuoteState
 * @property {CustomerInfo} customerInfo
 * @property {IntervalKey[]} selectedIntervals
 * @property {Multipliers} multipliers
 * @property {number} hourlyRate
 * @property {number} travelCost
 * @property {number} margin
 * @property {Record<IntervalKey, QuoteTask[]>} tasksByInterval
 */

/**
 * @typedef {QuoteTask & { multiplier: number, totalHours: number, cost: number }} CalculatedTask
 */

/**
 * @typedef {object} CalculatedInterval
 * @property {IntervalKey} key
 * @property {string} name
 * @property {number} occasions
 * @property {CalculatedTask[]} tasks
 * @property {number} totalHours
 * @property {number} costPerOccasion
 * @property {number} totalCostPerYear
 */

/**
 * @typedef {object} CalculationResult
 * @property {CalculatedInterval[]} intervals
 * @property {number} grandTotal
 */

export {};