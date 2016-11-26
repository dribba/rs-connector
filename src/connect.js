import React from 'react';

import Connector from './Connector';
import {ConnectKey, ConnectStore} from './models';


function collect(...fns) {
    return (value) => {
        for(var i = fns.length - 1; i >= 0; i--) {
            var value = fn[i](value);
            if (typeof value === 'undefined') {
                return value;
            }
        }
    }
}

function BuilderState(stores, connections) {
    return {
        stores: stores,
        connections: connections,

        merge(thatState) {
            var allConnections = connections.concat(thatState.connections)


            var finder = (store, connect) => (thatStore) => (thatStore === store) ? connect : undefined;
            var finders = [];
            var findConnection = (store) => {
                collect(finders)(store);
            }
            var newState = allConnections.reduce(({stores: storesAcc, connections: connectionsAcc}, {store, keys}) => {
                if (storesAcc.indexOf(store) === -1) {
                    let connect = new ConnectStore(store, keys);
                    finders.push(finder(store, connect));

                    return BuilderState(storesAcc.concat(store), connectionsAcc.concat(connect));
                } else {
                    var thisConnection = findConnection(store);

                    let connect = new ConnectStore(store, thisConnection.keys.concat(keys));
                    finders.push(finder(store, connect));

                    return BuilderState(storesAcc.concat(store), connectionsAcc.concat(connect));
                }
            }, BuilderState([], []));

            return newState;
        },

        

    };
}

function ConnectBuilder(state) {
    return {
        merge(thatBuilder) {
            return ConnectBuilder(state.merge(thatBuilder.getState()));
        },
        getState() {
            return state;
        },
        toComponent(Component) {
            return Connector(Component, state.connections);
        }
    };
}


function resolveKeyString(key) {
    var lastDotIdx = key.lastIndexOf('.');
    var keyName = (lastDotIdx !== -1) ? key.substr(lastDotIdx + 1) : key;
    return [new ConnectKey(keyName, key)];
}

// [['a.b.c', 'r']] => [['r', 'a.b.c']]
// ['a.b.c', 'c.d.e'] => [['c', 'a.b.c'], ['e', 'c.d.e']]
function resolveKeysArray(keys) {
    var resolveArray = ([key, name]) => new ConnectKey(name, key);

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
    console.log(typeof keys);
    if (keys && typeof keys === 'object') {
        return resolveKeyObject(keys);
    } else if (typeof keys === 'string') {
        return resolveKeyString(keys);
    } else if (keys instanceof Array) {
        return resolveKeysArray(keys); 
    }

    return [];
}


export default function connect(rsKeys, store) {
    var allKeys = resolveKeys(rsKeys);
    var connection = new ConnectStore(store, allKeys);
    return ConnectBuilder(BuilderState([store], [connection]));
}