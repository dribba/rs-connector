export default function ConnectKey(stateKey, storeKey) {
    this.stateKey = stateKey
    this.storeKey = storeKey
}
ConnectKey.prototype.toString = function() {
    return `ConnectKey(${this.stateKey}, ${this.storeKey})`;
}