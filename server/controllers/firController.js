const { validationResult } = require('express-validator');
const FIR = require('../models/FIR');
const { registerFIROnChain, verifyFIRRecord } = require('../services/blockchainService');

const createFIRId = () => `FIR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const submitFIR = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fir = await FIR.create({
      ...req.body,
      userId: req.user._id,
      firId: createFIRId(),
      status: 'pending'
    });

    const block = registerFIROnChain(fir);

    fir.blockchainHash = block.blockHash;
    fir.blockchainPreviousHash = block.previousHash;
    fir.blockchainBlockIndex = block.blockIndex;
    fir.blockchainDataHash = block.dataHash;
    fir.blockchainTimestamp = block.timestamp;

    await fir.save();

    return res.status(201).json({
      message: 'FIR submitted successfully and recorded on blockchain',
      fir: {
        id: fir._id,
        firId: fir.firId,
        status: fir.status,
        blockchainHash: fir.blockchainHash,
        blockIndex: fir.blockchainBlockIndex,
        timestamp: fir.blockchainTimestamp
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while submitting FIR', error: error.message });
  }
};

const getMyFIRs = async (req, res) => {
  const firs = await FIR.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(firs);
};

const getFIRById = async (req, res) => {
  const fir = await FIR.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('reviewedBy', 'name email');

  if (!fir) return res.status(404).json({ message: 'FIR not found' });

  if (fir.userId._id.toString() !== req.user._id.toString() && req.user.role === 'user') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(fir);
};

const updateFIRStatus = async (req, res) => {
  if (!['officer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Officer/Admin role required.' });
  }

  const fir = await FIR.findById(req.params.id);
  if (!fir) return res.status(404).json({ message: 'FIR not found' });

  const { status, reviewComments, rejectionReason, caseNumber, resolutionDetails } = req.body;
  const allowedStatuses = ['pending', 'under_review', 'approved', 'rejected', 'resolved'];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  if (status) fir.status = status;
  if (reviewComments !== undefined) fir.reviewComments = reviewComments;
  if (rejectionReason !== undefined) fir.rejectionReason = rejectionReason;
  if (caseNumber !== undefined) fir.caseNumber = caseNumber;
  if (resolutionDetails !== undefined) fir.resolutionDetails = resolutionDetails;

  fir.reviewedBy = req.user._id;

  await fir.save();
  res.json({ message: 'FIR status updated successfully', fir });
};

const getPendingFIRs = async (req, res) => {
  if (!['officer', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
  const firs = await FIR.find({ status: 'pending' }).sort({ createdAt: -1 }).populate('userId', 'name email phone');
  res.json(firs);
};

const getActiveFIRs = async (req, res) => {
  if (!['officer', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
  const firs = await FIR.find({ status: { $in: ['approved', 'under_review'] } }).sort({ createdAt: -1 }).populate('userId', 'name email phone');
  res.json(firs);
};

const verifyFIRIntegrity = async (req, res) => {
  const fir = await FIR.findById(req.params.id);
  if (!fir) return res.status(404).json({ message: 'FIR not found' });

  const verification = verifyFIRRecord(fir);
  res.json({ firId: fir.firId, ...verification });
};

module.exports = {
  submitFIR,
  getMyFIRs,
  getFIRById,
  updateFIRStatus,
  getPendingFIRs,
  getActiveFIRs,
  verifyFIRIntegrity
};
