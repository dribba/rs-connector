import React from 'react';
import ReactiveStore from 'reactive-store';

import Connector from './Connector';
import ConnectKey from './ConnectKey';
import Connection from './Connection';
import {
    mapAll,
    mapKey,
    mapObj,
    filterKey,
    filterKeys,
    filterObj,
    noDuplicates
} from './mappers';

function notUndefined(x) {
    return x !== undefined;
}
function nonEmptyObject(obj) {
    return Object.keys(obj).length > 0;
}
function identity(x) { return x; };
function always(x) { return () => x; };

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

function createChannel(rsKeys, store) {
    var allKeys = resolveKeys(rsKeys);
    var connection = Connection.create(store, allKeys);
    return ChannelApi(connection);
}

export default function Channel(rsKeys, store) {
    return createChannel(rsKeys, store)
        .filterKeys(notUndefined)
        .filter(nonEmptyObject);
}

Channel.dirty = function(rsKeys, store) {
    return createChannel(rsKeys, store);
};
Channel.private = function(rsKeys, useStore = identity, make = Channel) {
    var store = ReactiveStore();
    var channel = make(rsKeys, store);
    return [channel, useStore(store)];
};

function ChannelApi(connection) {
    return {
        _conn: connection,
        connect(Component) {
            return Connector(Component, connection);
        },
        wrap(Component) {
            return this.connect(Component);
        },
        tap(fn) {
            return ChannelApi(connection.tap(fn));
        },
        map(fn) {
            return ChannelApi(connection.map(fn));
        },
        mapAll(fn) {
            return this.map(mapAll(fn));
        },
        mapKey(key, fn) {
            return this.map(mapKey(key, fn));
        },
        mapObj(obj) {
            return this.map(mapObj(key, fn));
        },
        transform(obj) {
            return this.mapObj(obj);
        },
        filter(fn) {
            return ChannelApi(connection.filter(fn));
        },
        filterKeys(fn) {
            return this.map(filterKeys(fn));
        },
        filterKey(key, fn) {
            return this.map(filterKey(key, fn));
        },
        filterObj(obj) {
            return this.map(filterObj(obj));
        },
        noDuplicates() {
            return this.filter(noDuplicates());
        },
        concat(other, mergeFn) {
            return ChannelApi(connection.concat(other._conn, mergeFn));
        },
        merge(other, mergeFn) {
            return this.concat(other, mergeFn);
        },
        join(other, mergeFn) {
            return this.concat(other, mergeFn);
        },
        toString() {
            return `ChannelApi()`;
        }
    }
}