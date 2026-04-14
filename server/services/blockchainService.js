const SimpleBlockchain = require('../../blockchain/SimpleBlockchain');

const blockchain = new SimpleBlockchain();

const buildFIRPayload = (fir) => ({
  firId: fir.firId,
  complainantName: fir.complainantName,
  incidentDate: fir.incidentDate,
  incidentLocation: fir.incidentLocation,
  incidentDescription: fir.incidentDescription,
  createdAt: fir.createdAt
});

const registerFIROnChain = (fir) => {
  const payload = buildFIRPayload(fir);
  const block = blockchain.addFIRBlock(payload);

  return {
    blockIndex: block.index,
    blockHash: block.hash,
    previousHash: block.previousHash,
    timestamp: block.timestamp,
    nonce: block.nonce,
    dataHash: block.dataHash
  };
};

const verifyFIRRecord = (fir) => {
  const block = blockchain.findBlockByFIRId(fir.firId);

  if (!block) {
    return { isValid: false, reason: 'No blockchain record found for this FIR.' };
  }

  const payload = buildFIRPayload(fir);
  const expectedDataHash = blockchain.hashObject(payload);
  const fullChainValid = blockchain.isChainValid();

  const blockMatches =
    block.hash === fir.blockchainHash &&
    block.previousHash === fir.blockchainPreviousHash &&
    block.index === fir.blockchainBlockIndex &&
    block.dataHash === fir.blockchainDataHash &&
    block.dataHash === expectedDataHash;

  return {
    isValid: fullChainValid && blockMatches,
    fullChainValid,
    blockMatches,
    expectedDataHash,
    onChainDataHash: block.dataHash,
    block
  };
};

module.exports = {
  blockchain,
  registerFIROnChain,
  verifyFIRRecord
};
