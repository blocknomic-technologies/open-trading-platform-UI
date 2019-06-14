import TrezorConnect from 'trezor-connect';

class TrezorService {
  async trezorLogin() {
    const result = await TrezorConnect.requestLogin({
      challengeHidden: '912a069df1187ba5',
      challengeVisual: 'Login to Trezor',
    });
    return result;
  }
  async getPublicKey(path, coin) {
    const result = await TrezorConnect.getPublicKey({
      path,
      coin,
    });
    return result;
  }
  async getMultiplePublicKey(bundle) {
    const result = await TrezorConnect.getPublicKey({
      bundle,
    });
    return result;
  }
  async wipeDevice() {
    const result = await TrezorConnect.wipeDevice();
    return result;
  }
  async resetDevice() {
    const result = await TrezorConnect.resetDevice();
    return result;
  }
  async getAddress(path, showOnTrezor, coin) {
    const result = await TrezorConnect.getAddress({
      path,
      showOnTrezor,
      coin,
    });
    return result;
  }
  async getMultipleAddress(bundle) {
    const result = await TrezorConnect.getAddress({
      bundle,
    });
    return result;
  }
  async getAccountInfoUsingPath(path, coin) {
    const result = await TrezorConnect.getAccountInfo({
      path,
      coin,
    });
    return result;
  }
  async getAccountInfoUsingPublicKey(xpub, coin) {
    const result = await TrezorConnect.getAccountInfo({
      xpub,
      coin,
    });
    return result;
  }
  async getAccountInfoUsingDiscovery(coin) {
    const result = await TrezorConnect.getAccountInfo({
      coin,
    });
    return result;
  }
  async composeTransaction(outputs, coin, push) {
    const result = await TrezorConnect.composeTransaction({
      outputs,
      coin,
      push,
    });
    return result;
  }
  async signTransaction(inputs, outputs, coin, push) {
    const result = await TrezorConnect.signTransaction({
      inputs,
      outputs,
      coin,
      push,
    });
    return result;
  }
  async pushTransaction(tx, coin) {
    const result = await TrezorConnect.pushTransaction({
      tx,
      coin,
    });
    return result;
  }
  async signMessage(path, message, coin) {
    const result = await TrezorConnect.signMessage({
      path,
      message,
      coin,
    });
    return result;
  }
  async verifyMessage(address, message, signature, coin) {
    const result = await TrezorConnect.verifyMessage({
      address,
      message,
      signature,
      coin,
    });
    return result;
  }
  async ethereumGetAddress(path, showOnTrezor) {
    const result = await TrezorConnect.ethereumGetAddress({
      path,
      showOnTrezor,
    });
    return result;
  }
  async ethereumMultipleGetAddress(bundle) {
    const result = await TrezorConnect.ethereumGetAddress({
      bundle,
    });
    return result;
  }
  async ethereumSignTransaction(path, transaction) {
    const result = await TrezorConnect.ethereumSignTransaction({
      path,
      transaction,
    });
    return result;
  }
  async ethereumSignMessage(path, message, hex) {
    const result = await TrezorConnect.ethereumSignMessage({
      path,
      message,
      hex,
    });
    return result;
  }
  async ethereumVerifyMessage(address, message, hex, signature) {
    const result = await TrezorConnect.ethereumVerifyMessage({
      address,
      message,
      hex,
      signature,
    });
    return result;
  }
  async nemGetAddress(path, network, showOnTrezor) {
    const result = await TrezorConnect.nemGetAddress({
      path,
      network,
      showOnTrezor,
    });
    return result;
  }
  async nemMultipleGetAddress(bundle) {
    const result = await TrezorConnect.nemGetAddress({
      bundle,
    });
    return result;
  }
  async nemSignTransaction(path, transaction) {
    const result = await TrezorConnect.requestLogin({
      path,
      transaction,
    });
    return result;
  }
  async stellarGetAddress(path, showOnTrezor) {
    const result = await TrezorConnect.stellarGetAddress({
      path,
      showOnTrezor,
    });
    return result;
  }
  async stellarMultipleGetAddress(bundle) {
    const result = await TrezorConnect.stellarGetAddress({
      bundle,
    });
    return result;
  }
  async stellarSignTransaction(path, networkPassphrase, transaction) {
    const result = await TrezorConnect.stellarSignTransaction({
      path,
      networkPassphrase,
      transaction,
    });
    return result;
  }
  async liskGetAddress(path, showOnTrezor) {
    const result = await TrezorConnect.liskGetAddress({
      path,
      showOnTrezor,
    });
    return result;
  }
  async liskMultipleGetAddress(bundle) {
    const result = await TrezorConnect.liskGetAddress({
      bundle,
    });
    return result;
  }
  async liskSignTransaction(path, transaction) {
    const result = await TrezorConnect.liskSignTransaction({
      path,
      transaction,
    });
    return result;
  }
  async liskSignMessage(path, message) {
    const result = await TrezorConnect.liskSignMessage({
      path,
      message,
    });
    return result;
  }
  async liskVerifyMessage(publicKey, signature, message) {
    const result = await TrezorConnect.liskVerifyMessage({
      publicKey,
      signature,
      message,
    });
    return result;
  }
  async cardanoGetPublicKey(path, showOnTrezor) {
    const result = await TrezorConnect.cardanoGetPublicKey({
      path,
      showOnTrezor,
    });
    return result;
  }
  async cardanoMultipleGetPublicKey(bundle) {
    const result = await TrezorConnect.cardanoGetPublicKey({
      bundle,
    });
    return result;
  }
  async cardanoGetAddress(path, showOnTrezor) {
    const result = await TrezorConnect.cardanoGetAddress({
      path,
      showOnTrezor,
    });
    return result;
  }
  async cardanoMultipleGetAddress(bundle) {
    const result = await TrezorConnect.cardanoGetAddress({
      bundle,
    });
    return result;
  }
  async cardanoSignTransaction(inputs, outputs, transactions, network) {
    const result = await TrezorConnect.cardanoSignTransaction({
      inputs,
      outputs,
      transactions,
      network,
    });
    return result;
  }
  async rippleGetAddress(path, showOnTrezor) {
    const result = await TrezorConnect.rippleGetAddress({
      path,
      showOnTrezor,
    });
    return result;
  }
  async rippleMultipleGetAddress(bundle) {
    const result = await TrezorConnect.rippleGetAddress({
      bundle,
    });
    return result;
  }
  async rippleSignTransaction(path, transaction) {
    const result = await TrezorConnect.requestLogin({
      path,
      transaction,
    });
    return result;
  }
  async tezosGetPublicKey(path, showOnTrezor) {
    const result = await TrezorConnect.tezosGetPublicKey({
      path,
      showOnTrezor,
    });
    return result;
  }
  async tezosGetMultiplePublicKey(bundle) {
    const result = await TrezorConnect.tezosGetPublicKey({
      bundle,
    });
    return result;
  }
  async tezosGetAddress(path, showOnTrezor) {
    const result = await TrezorConnect.tezosGetAddress({
      path,
      showOnTrezor,
    });
    return result;
  }
  async tezosMultipleGetAddress(bundle) {
    const result = await TrezorConnect.tezosGetAddress({
      bundle,
    });
    return result;
  }
  async tezosSignTransaction(path, branch, operation) {
    const result = await TrezorConnect.requestLogin({
      path,
      branch,
      operation,
    });
    return result;
  }
}

export default new TrezorService();
