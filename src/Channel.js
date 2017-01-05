import React from 'react';
import ReactiveStore from 'reactive-store';

import Connector from './Connector';
import ConnectKey from './ConnectKey';
import Connection from './Connection';
import Pull from './Pull';
import Subscribe from './Subscribe';
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

Channel.constant = function(value) {
    return ChannelApi(Connection(Pull.constant(value), Subscribe.once));
}
Channel.fromProducer = function(producer) {
    return ChannelApi(Connection(Pull.empty, Subscribe.fromProducer(producer)));
}
Channel.dirty = function(rsKeys, store) {
    return createChannel(rsKeys, store);
};
Channel.private = function(rsKeys, useStore = (store => ({store})), make = Channel) {
    var store = ReactiveStore();
    var storeApi = useStore(store);
    return Channel.constant(storeApi).merge(make(rsKeys, store));
};

function ChannelApi(connection) {
    return {
        _conn: connection,
        connect(Component, filterDuplicates) {
            if (filterDuplicates === false) {
                return Connector(Component, connection);
            } else {
                return Connector(Component, this.noDuplicates()._conn);
            }
        },
        wrap(Component, noDuplicates) {
            return this.connect(Component, noDuplicates);
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