import axios from 'axios';
import { asyncHandler, ExternalServiceError, logger, retryAsync } from '../utils/errorHandler.js';
import { validateOrgan } from '../utils/validation.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_TIMEOUT = 30000; // 30 seconds

/**
 * Call ML service with retry logic and error handling
 */
const callMLService = async (endpoint, data) => {
  return retryAsync(
    async () => {
      try {
        const response = await axios.post(`${ML_SERVICE_URL}${endpoint}`, data, {
          timeout: ML_SERVICE_TIMEOUT,
        });
        return response.data;
      } catch (err) {
        if (err.code === 'ECONNREFUSED') {
          throw new ExternalServiceError('ML service is unavailable', 503);
        }
        if (err.response?.status === 404) {
          throw new ExternalServiceError('ML endpoint not found', 404);
        }
        if (err.code === 'ECONNABORTED') {
          throw new ExternalServiceError('ML service request timeout', 504);
        }
        throw err;
      }
    },
    3, // max retries
    1000 // initial delay
  );
};

/**
 * Smart match with ML integration
 */
exports.smartMatch = asyncHandler(async (req, res) => {
  const { organ, donorPatientData } = req.body;

  // Validate inputs
  if (!organ || !validateOrgan(organ)) {
    return res.status(400).json({ error: 'Invalid organ type' });
  }

  if (!Array.isArray(donorPatientData) || donorPatientData.length === 0) {
    return res.status(400).json({ error: 'donorPatientData must be a non-empty array' });
  }

  try {
    logger.info('Calling ML service for smart matching', { organ, dataCount: donorPatientData.length });

    const mlResponse = await callMLService('/predict_and_rank', {
      organ,
      donor_patient_data: donorPatientData,
    });

    logger.info('ML service returned successfully', { organ, resultCount: mlResponse.length });

    res.json({ topMatches: mlResponse || [] });
  } catch (err) {
    logger.error('ML service error', { organ, error: err.message });

    if (err instanceof ExternalServiceError) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    res.status(500).json({ error: 'Failed to process matching. Using fallback scoring.' });
  }
});
