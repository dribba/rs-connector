import React from 'react';

import Connector from './Connector';
import {ConnectKey, ConnectStore} from './models';

function findIndex(arr, pred) {
    for(var i = 0, len = arr.length; i < len; i++) {
        if (pred(arr[i])) return i;
    }
    return -1;
}

function BuilderState(stores, connections) {
    this.stores = stores;
    this.connections = connections;
}

BuilderState.prototype.merge = function merge(thatState) {
    var allConnections = this.connections.concat(thatState.connections);

    return allConnections.reduce(({stores: storesAcc, connections: connectionsAcc}, {store, keys}) => {
        if (storesAcc.indexOf(store) === -1) {
            let connect = new ConnectStore(store, keys);

            return new BuilderState(storesAcc.concat(store), connectionsAcc.concat(connect));
        } else {
            // find the existing connection
            let existingConnectionIdx = findIndex(connectionsAcc, conn => conn.store === store);
            let existingConnection = connectionsAcc[existingConnectionIdx];
            // create new connection
            let connect = new ConnectStore(store, existingConnection.keys.concat(keys));
            // replace old connection with the new one
            connectionsAcc[existingConnectionIdx] = connect; 

            return new BuilderState(storesAcc, connectionsAcc);
        }
    }, new BuilderState([], []));
};
BuilderState.prototype.toString = function toString() {
    return `BuilderState(${this.stores}, ${this.connections})`;
};

function ConnectBuilder(state) {
    this.state = state;
}
ConnectBuilder.prototype.merge = function merge(thatBuilder) {
    return new ConnectBuilder(this.state.merge(thatBuilder.getState()));
};
ConnectBuilder.prototype.getState = function getState() {
    return this.state;
};
ConnectBuilder.prototype.getConnections = function getConnections() {
    return this.state.connections;
};
ConnectBuilder.prototype.getStores = function getStores() {
    return this.state.stores;
};
ConnectBuilder.prototype.wrap = ConnectBuilder.prototype.toComponent = ConnectBuilder.prototype.connectComponent = 
    function toComponent(Component) {
        return Connector(Component, this.state.connections);
    };
ConnectBuilder.prototype.toString = function toString() {
    return `ConnectBuilder(${this.state})`;
};

function resolveKeyString(key) {
    var lastDotIdx = key.lastIndexOf('.');
    var keyName = (lastDotIdx !== -1) ? key.substr(lastDotIdx + 1) : key;
    return [new ConnectKey(keyName, key)];
}

function resolveKeysArray(keys) {
    var resolveArray = ([key, name]) => new ConnectKey(key, name);

    return keys.map(key => {
        if (typeof key === 'string') return resolveKeyString(key)[0];
        if (key instanceof Array) return resolveArray(key);
        else throw new Error('Key: ' + key + ' - Can\'t be resolved' );
    });
}

function resolveKeyObject(keys) {
    return Object.keys(keys).map(key => new ConnectKey(key, keys[key]));
}

function resolveKeys(keys) {
    // array needs to be checked before object, since typeof [] === 'object'
    if (keys instanceof Array) {
        return resolveKeysArray(keys); 
    } else if (keys && typeof keys === 'object') {
        return resolveKeyObject(keys);
    } else if (typeof keys === 'string') {
        return resolveKeyString(keys);
    } else {
        return [];
    }
}


export default function connect(rsKeys, store) {
    var allKeys = resolveKeys(rsKeys);
    var connection = new ConnectStore(store, allKeys);
    return new ConnectBuilder(new BuilderState([store], [connection]));
}