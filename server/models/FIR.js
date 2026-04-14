const mongoose = require('mongoose');

const firSchema = new mongoose.Schema(
  {
    firId: {
      type: String,
      required: true,
      unique: true,
      immutable: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true
    },
    caseNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    complainantName: { type: String, required: true, immutable: true },
    complainantPhone: { type: String, required: true, immutable: true },
    complainantEmail: { type: String, required: true, immutable: true },
    complainantAddress: { type: String, required: true, immutable: true },
    incidentDate: { type: Date, required: true, immutable: true },
    incidentLocation: { type: String, required: true, immutable: true },
    incidentDescription: { type: String, required: true, immutable: true },
    evidence: [
      {
        type: { type: String, enum: ['image', 'document', 'video', 'audio'] },
        url: String,
        description: String
      }
    ],
    witnesses: [
      {
        name: String,
        phone: String,
        address: String
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'resolved'],
      default: 'pending'
    },
    blockchainHash: { type: String, default: '', immutable: true },
    blockchainPreviousHash: { type: String, default: '', immutable: true },
    blockchainDataHash: { type: String, default: '', immutable: true },
    blockchainBlockIndex: { type: Number, default: -1, immutable: true },
    blockchainTimestamp: { type: Date, immutable: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewComments: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    resolutionDetails: { type: String, default: '' },
    finalReport: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FIR', firSchema);
