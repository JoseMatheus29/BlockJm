const { ethers } = require('ethers');

const nonces = new Map();

const generateNonce = (address) => {
  const nonce = Math.floor(Math.random() * 1000000);
  if (address) {
    nonces.set(address.toLowerCase(), { nonce, createdAt: Date.now() });
  }
  return nonce;
};

/**
 * Verify login by checking stored nonce and validating the signature.
 * @param {string} address - the expected signer address
 * @param {string} signature - signature of the nonce
 * @param {string|number} nonce - nonce value provided by the client
 * @returns {Promise<boolean>} whether the login is valid
 */
const verifyLogin = async (address, signature, nonce) => {
  if (!address || !signature) return false;
  const key = address.toLowerCase();
  const stored = nonces.get(key);
  if (!stored) return false;

  if (String(stored.nonce) !== String(nonce)) return false;

  try {
    const recovered = ethers.verifyMessage(String(nonce), signature);
    if (recovered && recovered.toLowerCase() === key) {
      nonces.delete(key);
      return true;
    }
  } catch (err) {
    return false;
  }

  return false;
};

module.exports = { generateNonce, verifyLogin };
