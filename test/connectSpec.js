import Connector from '../src/Connector';
import connect from '../src/connect';
import {ConnectKey, ConnectStore} from '../src/models';
import tape from 'tape';
import React from 'react';
import ReactiveStore from 'reactive-store';
import { createRenderer } from 'react-addons-test-utils';
import addAssertions from 'extend-tape';
import jsxEquals from 'tape-jsx-equals';

const test = addAssertions(tape, {jsxEquals});

function key(stateKey, storeKey) {
    return new ConnectKey(stateKey, storeKey || stateKey);
}
function storeConnection(store, keys) {
    keys = keys instanceof Array ? keys : [keys];
    return new ConnectStore(store, keys);
}

test('connects to a single key in a store', (t) => {
    var RS = ReactiveStore();
    var connection = connect('foo', RS);

    t.equal(typeof connection.merge, 'function', 'connections have merge function');
    t.equal(typeof connection.toComponent, 'function', 'connections have toComponent function');
    t.end();
});

// Key resolution tests
test('resolves a single string key', (t) => {
    var RS = ReactiveStore();
    var connection = connect('foo', RS);

    t.equal(connection.getConnections().length, 1, 'connection was created');
    t.looseEqual(connection.getConnections()[0].keys, [ key('foo') ], 'correct key connections created');
    t.end();
});
test('resolves multiple string keys', (t) => {
    var RS = ReactiveStore();
    var connection = connect(['foo', 'bar', 'baz[0]'], RS);

    t.equal(connection.getConnections().length, 1, 'connection was created');
    t.looseEqual(connection.getConnections()[0].keys, [ key('foo'), key('bar'), key('baz[0]') ], 'correct key connections created');
    t.end();
});
test('resolves object keys', (t) => {
    var RS = ReactiveStore();
    var connection = connect({
        'f.o.o': 'foo', 
        b: 'bar', 
        c: 'baz[0]'
    }, RS);

    t.equal(connection.getConnections().length, 1, 'connection was not created');
    t.looseEqual(connection.getConnections()[0].keys, [ key('f.o.o', 'foo'), key('b', 'bar'), key('c', 'baz[0]') ], 'correct key connections created');
    t.end();
});
test('resolves array of arrays keys', (t) => {
    var RS = ReactiveStore();
    var connection = connect([
        ['f.o.o', 'foo'], 
        ['b', 'bar'], 
        ['c', 'baz[0]']
    ], RS);

    t.equal(connection.getConnections().length, 1, 'connection was created');
    t.looseEqual(connection.getConnections()[0].keys, [ key('f.o.o', 'foo'), key('b', 'bar'), key('c', 'baz[0]') ], 'correct key connections created');
    t.end();
});
test('connections can be merged(single store)', (t) => {
    var RS = ReactiveStore();
    var connection1 = connect('foo', RS);
    var connection2 = connect('bar', RS);
    var connection = connection1.merge(connection2);

    t.equal(connection.getConnections().length, 1, 'connection was created');
    t.looseEqual(connection.getConnections()[0].keys, [ key('foo'), key('bar')], 'correct key connections created');
    t.end();
});
test('connections can be merged(multi store)', (t) => {
    var RS1 = ReactiveStore();
    var RS2 = ReactiveStore();
    var connection1 = connect('foo', RS1);
    var connection2 = connect('bar', RS2);
    var connection = connection1.merge(connection2);

    t.equal(connection.getStores().length, 2, 'correct number of store');
    t.equal(connection.getConnections().length, 2, 'connection was created');
    t.looseEqual(connection.getConnections()[0].keys, [ key('foo') ], 'correct key connections created');
    t.looseEqual(connection.getConnections()[1].keys, [ key('bar') ], 'correct key connections created');
    t.end();
});
test('connections can connect to a React component', (t) => {
    var RS1 = ReactiveStore();
    var connection = connect({
        'name': 'user.name'
    }, RS1);
    var ExampleComponent = (props) => (<div>{props.name}</div>);

    // API
    t.equal(typeof connection.wrap, 'function', 'wrap function exists');
    t.equal(typeof connection.toComponent, 'function', 'toComponent function exists');
    t.equal(typeof connection.connectComponent, 'function', 'connectComponent function exists');
    
    // rendering
    var ConnectedComponent = connection.wrap(ExampleComponent);
    var renderer = createRenderer();
    renderer.render(<ConnectedComponent name="Anonymous" />);
    var result = renderer.getRenderOutput();
    t.jsxEquals(result, <ExampleComponent name="Anonymous" />, 'received original props');

    // updating
    RS1.set('user.name', 'John');
    renderer.render(<ConnectedComponent />);
    result = renderer.getRenderOutput();
    t.jsxEquals(result, <ExampleComponent name="John" />, 'receives store props');

    t.end();
});
test('connections can map state keys', (t) => {
    var RS1 = ReactiveStore();
    var connection1 = connect({
        'name': 'user.name'
    }, RS1);
    var RS2 = ReactiveStore();
    var connection2 = connect({
        'email': 'user.email'
    }, RS2);
    var connection = connection1.merge(connection2);
    var ExampleComponent = (props) => (<div>{props.name}</div>);
    RS1.set('user.name', 'John');
    RS2.set('user.email', 'john@example.com');

    // rendering
    var ConnectedComponent = connection.wrap(ExampleComponent);
    var renderer = createRenderer();
    renderer.render(<ConnectedComponent />);
    var result = renderer.getRenderOutput();
    t.jsxEquals(result, <ExampleComponent name="John" email="john@example.com" />, 'no props when there\'s no data in stores');

    // update
    RS1.set('user.name', 'Mike');
    RS2.set('user.email', 'mike@example.com');
    renderer.render(<ConnectedComponent />);
    result = renderer.getRenderOutput();
    t.jsxEquals(result, <ExampleComponent name="Mike" email="mike@example.com" />, 'receives store props');

    t.end();
});




