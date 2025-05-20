// src/services/errorLogger.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Logs errors to Firestore for monitoring and debugging
 * @param {string} errorType - Category of the error
 * @param {string} errorMessage - Detailed error message
 * @param {Object} metadata - Additional data about the error context
 * @param {string} userId - User ID if available
 */
export const logError = async (errorType, errorMessage, metadata = {}, userId = null) => {
  try {
    // Create the error object
    const errorLog = {
      type: errorType,
      message: errorMessage,
      timestamp: serverTimestamp(),
      userId: userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV
      }
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`ERROR [${errorType}]:`, errorMessage, metadata);
    }
    
    // Always log to Firestore
    await addDoc(collection(db, 'error_logs'), errorLog);
    
  } catch (loggingError) {
    // If logging itself fails, at least write to console
    console.error('Error logging failed:', loggingError);
    console.error('Original error:', errorType, errorMessage, metadata);
  }
};

/**
 * Logs address resolution errors specifically
 * @param {string} searchTerm - What the user searched for
 * @param {string} errorDetails - Specific error details
 * @param {Object} responseData - API response if available
 * @param {string} userId - User ID if available
 */
export const logAddressError = async (searchTerm, errorDetails, responseData = null, userId = null) => {
  await logError(
    'ADDRESS_RESOLUTION', 
    `Failed to find address: ${searchTerm}`, 
    {
      searchTerm,
      errorDetails,
      responseData,
      timestamp: new Date().toISOString()
    },
    userId
  );
};

/**
 * Logs authentication errors specifically
 * @param {string} authMethod - Authentication method (email, google, etc.)
 * @param {string} errorCode - Firebase auth error code
 * @param {string} errorMessage - Error message
 * @param {string} email - User email if available (partially redacted)
 */
export const logAuthError = async (authMethod, errorCode, errorMessage, email = null) => {
  // Partially redact email for privacy
  let redactedEmail = null;
  if (email) {
    const parts = email.split('@');
    if (parts.length === 2) {
      const username = parts[0];
      const domain = parts[1];
      redactedEmail = `${username.substring(0, 2)}***@${domain}`;
    } else {
      redactedEmail = '***@***.com';
    }
  }
  
  await logError(
    'AUTHENTICATION', 
    `Auth error [${authMethod}]: ${errorCode}`, 
    {
      authMethod,
      errorCode,
      errorMessage,
      redactedEmail,
      timestamp: new Date().toISOString()
    }
  );
};

export default {
  logError,
  logAddressError,
  logAuthError
};