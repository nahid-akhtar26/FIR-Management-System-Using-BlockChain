const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const FIR = require('../models/FIR');
const { blockchain, verifyFIRRecord } = require('../services/blockchainService');

const router = express.Router();

router.get('/chain/validate', auth, asyncHandler(async (req, res) => {
  if (!['officer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({ isValid: blockchain.isChainValid(), blocks: blockchain.chain.length });
}));

router.get('/fir/:id/verify', auth, asyncHandler(async (req, res) => {
  const fir = await FIR.findById(req.params.id);
  if (!fir) {
    return res.status(404).json({ message: 'FIR not found' });
  }

  const result = verifyFIRRecord(fir);
  res.json({ firId: fir.firId, ...result });
}));

module.exports = router;
