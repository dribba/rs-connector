export function ConnectKey(stateKey, storeKey) {
    this.stateKey = stateKey
    this.storeKey = storeKey
}
ConnectKey.prototype.toString = function() {
    return `ConnectKey(${stateKey}, ${storeKey})`;
}

export function ConnectStore(store, keys) {
    this.store = store;
    this.keys = keys;
}
ConnectStore.prototype.toString = function() {
    return `ConnectStore(${this.store}, ${this.keys})`;
}