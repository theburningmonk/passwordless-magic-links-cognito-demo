const KMS = require('aws-sdk/clients/kms')
const KmsClient = new KMS()

const { KMS_KEY_ID } = process.env

const encrypt = async (input) => {
  const resp = await KmsClient.encrypt({
    KeyId: KMS_KEY_ID,
    Plaintext: input
  }).promise()

  return resp.CiphertextBlob
}

const decrypt = async (ciphertext) => {
  const resp = await KmsClient.decrypt({
    CiphertextBlob: Buffer.from(ciphertext, 'base64')
  }).promise()

  return resp.Plaintext
}

module.exports = {
  encrypt,
  decrypt
}