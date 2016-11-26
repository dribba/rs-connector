export function ConnectKey(stateKey, storeKey) {
    this.stateKey = stateKey
    this.storeKey = storeKey

    this.toString = () => {
        return `ConnectKey(${stateKey}, ${storeKey})`;
    }
}
export function ConnectStore(store, keys) {
    this.store = store;
    this.keys = keys;

    this.toString = () => {
        return `ConnectStore(${store}, ${keys})`;
    }
}