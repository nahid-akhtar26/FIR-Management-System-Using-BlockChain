const crypto = require('crypto');

// Simulated Blockchain Service
// In production, this would connect to an actual blockchain network (Ethereum, Hyperledger, etc.)

/**
 * Generate blockchain hash for FIR data
 * @param {Object} firData - FIR document
 * @returns {Object} - Hash and transaction ID
 */
const generateBlockchainHash = async (firData) => {
  try {
    // Create a string representation of the FIR data
    const dataString = JSON.stringify({
      id: firData._id.toString(),
      userId: firData.userId.toString(),
      complainantName: firData.complainantName,
      incidentDate: firData.incidentDate,
      incidentLocation: firData.incidentLocation,
      incidentDescription: firData.incidentDescription,
      createdAt: firData.createdAt
    });

    // Generate SHA-256 hash (simulating blockchain hash)
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    // Generate transaction ID (simulating blockchain transaction)
    const transactionId = crypto.createHash('sha256')
      .update(dataString + Date.now().toString())
      .digest('hex');

    // In production, this would:
    // 1. Create a smart contract transaction
    // 2. Submit to blockchain network
    // 3. Wait for confirmation
    // 4. Return transaction hash and block number

    return {
      hash: `0x${hash}`,
      transactionId: `0x${transactionId}`,
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(Math.random() * 1000000) // Simulated block number
    };
  } catch (error) {
    console.error('Blockchain Hash Generation Error:', error);
    throw error;
  }
};

/**
 * Verify blockchain hash
 * @param {String} hash - Blockchain hash to verify
 * @param {Object} data - Original data to verify against
 * @returns {Boolean} - True if hash is valid
 */
const verifyBlockchainHash = async (hash, data) => {
  try {
    const dataString = JSON.stringify(data);
    const computedHash = crypto.createHash('sha256').update(dataString).digest('hex');
    return `0x${computedHash}` === hash;
  } catch (error) {
    console.error('Blockchain Verification Error:', error);
    return false;
  }
};

module.exports = {
  generateBlockchainHash,
  verifyBlockchainHash
};

