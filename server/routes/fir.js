const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { submitFIRValidator } = require('../validators/firValidators');
const {
  submitFIR,
  getMyFIRs,
  getFIRById,
  updateFIRStatus,
  getPendingFIRs,
  getActiveFIRs,
  verifyFIRIntegrity
} = require('../controllers/firController');
const FIR = require('../models/FIR');

const router = express.Router();

router.post('/submit', auth, submitFIRValidator, asyncHandler(submitFIR));
router.get('/my-firs', auth, asyncHandler(getMyFIRs));
router.get('/all/pending', auth, asyncHandler(getPendingFIRs));
router.get('/all/active', auth, asyncHandler(getActiveFIRs));
router.get('/:id/verify', auth, asyncHandler(verifyFIRIntegrity));
router.get('/:id', auth, asyncHandler(getFIRById));
router.put('/:id/status', auth, asyncHandler(updateFIRStatus));

router.get('/:id/report', auth, asyncHandler(async (req, res) => {
  const fir = await FIR.findById(req.params.id).populate('userId', 'name email phone').populate('reviewedBy', 'name email');

  if (!fir) {
    return res.status(404).json({ message: 'FIR not found' });
  }

  if (fir.userId._id.toString() !== req.user._id.toString() && !['officer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const report = `FIR REPORT\n==========\n\nFIR ID: ${fir.firId}\nCase Number: ${fir.caseNumber || 'N/A'}\nStatus: ${fir.status.toUpperCase()}\nDate Generated: ${new Date().toLocaleString()}\n\nComplainant: ${fir.complainantName}\nIncident Date: ${new Date(fir.incidentDate).toLocaleString()}\nLocation: ${fir.incidentLocation}\nDescription: ${fir.incidentDescription}\n\nBlockchain Hash: ${fir.blockchainHash}\nBlock Index: ${fir.blockchainBlockIndex}\nBlock Timestamp: ${fir.blockchainTimestamp}\n`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="FIR-Report-${fir.firId}.txt"`);
  res.send(report);
}));

module.exports = router;
