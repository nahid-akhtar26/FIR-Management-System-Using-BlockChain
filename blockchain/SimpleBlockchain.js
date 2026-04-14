const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SimpleBlockchain {
  constructor(storageFile = path.join(__dirname, 'chain.json')) {
    this.storageFile = storageFile;
    this.chain = this.loadChain();
  }

  loadChain() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const parsed = JSON.parse(fs.readFileSync(this.storageFile, 'utf8'));
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load blockchain file, creating a new chain.', error);
    }

    const genesis = this.createGenesisBlock();
    this.persistChain([genesis]);
    return [genesis];
  }

  persistChain(chain = this.chain) {
    fs.writeFileSync(this.storageFile, JSON.stringify(chain, null, 2));
  }

  createGenesisBlock() {
    const genesisPayload = {
      description: 'FIR Management Genesis Block',
      createdBy: 'system'
    };

    return {
      index: 0,
      timestamp: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      firId: 'GENESIS',
      dataHash: this.hashObject(genesisPayload),
      previousHash: '0',
      nonce: 0,
      hash: this.calculateBlockHash({
        index: 0,
        timestamp: new Date('2024-01-01T00:00:00.000Z').toISOString(),
        firId: 'GENESIS',
        dataHash: this.hashObject(genesisPayload),
        previousHash: '0',
        nonce: 0
      })
    };
  }

  hashObject(value) {
    return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  }

  calculateBlockHash({ index, timestamp, firId, dataHash, previousHash, nonce }) {
    return crypto
      .createHash('sha256')
      .update(`${index}|${timestamp}|${firId}|${dataHash}|${previousHash}|${nonce}`)
      .digest('hex');
  }

  mineBlock(payload, difficulty = 2) {
    const previousBlock = this.chain[this.chain.length - 1];
    const index = this.chain.length;
    const timestamp = new Date().toISOString();
    const dataHash = this.hashObject(payload);
    const firId = payload.firId;
    const previousHash = previousBlock.hash;

    let nonce = 0;
    let hash = this.calculateBlockHash({
      index,
      timestamp,
      firId,
      dataHash,
      previousHash,
      nonce
    });

    const prefix = '0'.repeat(difficulty);
    while (!hash.startsWith(prefix)) {
      nonce += 1;
      hash = this.calculateBlockHash({
        index,
        timestamp,
        firId,
        dataHash,
        previousHash,
        nonce
      });
    }

    return {
      index,
      timestamp,
      firId,
      dataHash,
      previousHash,
      nonce,
      hash
    };
  }

  addFIRBlock(payload) {
    const block = this.mineBlock(payload);
    this.chain.push(block);
    this.persistChain();
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  findBlockByFIRId(firId) {
    return this.chain.find((block) => block.firId === firId);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i += 1) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      const computedHash = this.calculateBlockHash(current);

      if (current.hash !== computedHash) {
        return false;
      }

      if (current.previousHash !== previous.hash) {
        return false;
      }
    }

    return true;
  }
}

module.exports = SimpleBlockchain;
