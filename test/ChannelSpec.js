import React from 'react';
import { createRenderer } from 'react-addons-test-utils';

import tape from 'tape';
import addAssertions from 'extend-tape';
import jsxEquals from 'tape-jsx-equals';

import ReactiveStore from 'reactive-store';
import Channel from '../src/Channel';

const test = addAssertions(tape, {jsxEquals});

test('connects to a single key in a store', (t) => {
    var RS = ReactiveStore();
    var channel = Channel('foo', RS);

    t.equal(typeof channel.connect, 'function', 'connections have connect function');
    t.equal(typeof channel.wrap, 'function', 'connections have wrap function');
    t.equal(typeof channel.tap, 'function', 'connections have tap function');
    t.equal(typeof channel.map, 'function', 'connections have map function');
    t.equal(typeof channel.mapAll, 'function', 'connections have mapAll function');
    t.equal(typeof channel.mapKey, 'function', 'connections have mapKey function');
    t.equal(typeof channel.mapObj, 'function', 'connections have mapObj function');
    t.equal(typeof channel.transform, 'function', 'connections have transform function');
    t.equal(typeof channel.filter, 'function', 'connections have filter function');
    t.equal(typeof channel.filterKeys, 'function', 'connections have filterKeys function');
    t.equal(typeof channel.filterKey, 'function', 'connections have filterKey function');
    t.equal(typeof channel.filterObj, 'function', 'connections have filterObj function');
    t.equal(typeof channel.noDuplicates, 'function', 'connections have filterObj function');
    t.equal(typeof channel.concat, 'function', 'connections have concat function');
    t.equal(typeof channel.merge, 'function', 'connections have merge function');
    t.equal(typeof channel.join, 'function', 'connections have join function');
    t.end();
});
test('resolves a single key with no updates', (t) => {
    t.plan(3);
    var RS = ReactiveStore();
    RS.set('foo', 42);

    var channel = Channel('foo', RS);
    var unsubscribe = channel._conn.connect((state, firstRun) => {
        t.equal(firstRun, true, 'receives firstRun=true when it\'s a sync pull');
        t.equal(state.foo, 42, 'Receives initial state when exists');
        t.notOk(!firstRun, 'Should not be called with updates');
    });

    unsubscribe();
});
test('resolves multiple keys with no updates', (t) => {
    t.plan(5);
    var RS = ReactiveStore();
    RS.set('foo', 42);
    RS.set('baz', [ 'works' ]);

    var channel = Channel(['foo', 'bar', ['baz', 'baz[0]']], RS);

    var unsubscribe = channel._conn.connect((state, firstRun) => {
        t.equal(firstRun, true, 'receives firstRun=true when it\'s a sync pull');
        t.equal(state.foo, 42, 'Receives initial state when exists');
        t.equal(state.bar, undefined, 'Does not receive key, when empty in store');
        t.equal(state.baz, 'works', 'Can rename keys and extract from arrays');
        t.notOk(!firstRun, 'Should not be called with updates');
    });

    unsubscribe();
});
test('receives updates for single key no initial', (t) => {
    t.plan(2);
    var RS = ReactiveStore();
    var channel = Channel('foo', RS);

    var unsubscribe = channel._conn.connect((state, firstRun) => {
        t.equal(firstRun, false, 'only receives updates');
        t.equal(state.foo, 42, 'receives value from update');
    });

    RS.set('foo', 42);
    
    unsubscribe();
});
test('can filter updates', (t) => {
    t.plan(1);
    var RS = ReactiveStore();
    var channel = Channel('foo', RS).filter((state) => state.foo === 42);

    var unsubscribe = channel._conn.connect((state, firstRun) => {
        t.notOk(false, 'should not be called evah!');
    });

    RS.set('foo', 42);

    unsubscribe();
});
test('resolves object keys', (t) => {
    t.plan(3);
    var RS = ReactiveStore();
    var channel = Channel({
        'f.o.o': 'foo', 
        e: 'empty', 
        b: 'bar', 
    }, RS);
    RS.set('foo', 42);
    RS.set('bar', 'test');

    var unsubscribe = channel._conn.connect((state, firstRun) => {
        t.equal(state['f.o.o'], 42, 'receives string prop');
        t.equal(state.b, 'test', 'receives object renamed prop');
        t.equal(state.e, undefined, 'does not receive renamed empty props');
    });

    unsubscribe();
});
test('connections can be merged(single store, single key)', (t) => {
    t.plan(6);
    var RS = ReactiveStore();
    var channel1 = Channel('foo', RS);
    var channel2 = Channel('bar', RS);
    var channel = channel1.merge(channel2).noDuplicates();

    RS.set('foo', 42);
    RS.set('bar', 'test');

    var ran = false;
    var unsubscribe = channel._conn.connect((state, firstRun) => {
        t.ok(ran !== firstRun, 'firstRun should be true only once')
        // before update
        firstRun && t.equal(state.foo, 42, 'receives values from channel1');
        // after update
        !firstRun && t.equal(state.foo, 22, 'receives values from channel1');
        t.equal(state.bar, 'test', 'receives values from channel2');
        if (!ran) ran = true;
    });

    RS.set('foo', 22);

    unsubscribe();
});
test('connections can be merged(multi store)', (t) => {
    t.plan(8);
    var RS1 = ReactiveStore();
    RS1.set('foo', 42);
    var channel1 = Channel('foo', RS1);
    var channel2 = Channel.private('bar', store => {
        // set initial state
        store.set('bar', 'shhh, this is private');
        return {
            update() {
                store.set('bar', 'updated');
            } 
        };
    });
    var channel = channel1.merge(channel2).noDuplicates();

    var ran = false;
    var runCount = 0;
    var unsubscribe = channel._conn.connect((state, firstRun) => {
        runCount++;
        t.ok(ran !== firstRun, 'firstRun should be true only once')
        t.equal(state.foo, 42, 'receives values from channel1');
        
        firstRun && t.equal(state.bar.indexOf('private'), 14, 'receives values from channel1');
        !firstRun && t.equal(state.bar, 'updated', 'receives values from channel1');
        t.ok(runCount <= 2, 'should only update once');
        state.update();
        if (!ran) ran = true;
    });

    unsubscribe();
});
test('connections can be merged(multi store, same store key name)', (t) => {
    t.plan(2);
    var RS1 = ReactiveStore();
    var RS2 = ReactiveStore();
    RS1.set('foo', 42);
    RS2.set('foo', "RS2's");
    var channel1 = Channel('foo', RS1);
    var channel2 = Channel({ 'bar': 'foo' }, RS2);
    var channel = channel1.merge(channel2).noDuplicates();

    var unsubscribe = channel._conn.connect((state, firstRun) => {
        t.equal(state.foo, 42, 'receives values from channel1');
        t.equal(state.bar, "RS2's", 'receives values from channel2');
    });

    unsubscribe();
});
test('connections can be mapped on', (t) => {
    t.plan(2);
    var RS1 = ReactiveStore();
    RS1.set('foo', 42);
    var halfFoo = Channel('foo', RS1).mapKey('foo', x => x / 2);

    var unsubscribe = halfFoo._conn.connect((state, firstRun) => {
        firstRun && t.equal(state.foo, 21, 'receives initial mapped value');
        !firstRun && t.equal(state.foo, 28, 'receives update mapped value');
    });

    RS1.set('foo', 56);

    unsubscribe();
});
test('connections can be filtered on', (t) => {
    t.plan(4);
    var RS1 = ReactiveStore();
    RS1.set('foo', 42);
    var oddFoos = Channel('foo', RS1).filter(({foo}) => foo % 2 !== 0);

    var update = 0;
    var unsubscribe = oddFoos._conn.connect((state, firstRun) => {
        update++
        t.equal(state.foo % 2, 1, 'always odd');
        update === 1 && t.equal(state.foo, 43, 'receives first update');
        update === 2 && t.equal(state.foo, 13, 'receives second update');
    });

    RS1.set('foo', 43);
    RS1.set('foo', 13);

    unsubscribe();
});
test('connections can map, filter and concat(with custom function)', (t) => {
    t.plan(1);
    var RS1 = ReactiveStore();
    RS1.set('foo', 42);
    RS1.set('bar', '7');
    RS1.set('baz', '3');
    // 21 = (42 / 2)
    // 28 = (56 / 2)
    var halfFoo = Channel('foo', RS1)
        .filter(({foo}) => foo !== 42)
        .mapKey('foo', x => x / 2);
    var barBaz = Channel(['bar', 'baz'], RS1).mapAll(parseInt);
    var superMathChannel = halfFoo.merge(barBaz, ({foo}, {bar, baz}) => {
        return {
            // (21 / 7) * 3 = 9
            // (28 / 7) * 3 = 12
            superMath: (foo / bar) * (baz)
        };
    }).noDuplicates();

    var unsubscribe = superMathChannel._conn.connect((state, firstRun) => {
        !firstRun && t.equal(state.superMath, 12, 'receives the mapped, filtered and merged update');
    });

    // should still not update by this
    RS1.set('foo', 42);
    // second run = 12
    RS1.set('foo', 56);

    unsubscribe();
});
test('connections can Channel to a React component', (t) => {
    var RS1 = ReactiveStore();
    var channel = Channel({
        'name': 'user.name'
    }, RS1);
    var ExampleComponent = (props) => (<div>{props.name}</div>);

    // API
    t.equal(typeof channel.connect, 'function', 'connect function exists');
    t.equal(typeof channel.wrap, 'function', 'wrap function exists');
    
    // rendering
    var ConnectedComponent = channel.wrap(ExampleComponent);
    var renderer = createRenderer();
    renderer.render(<ConnectedComponent name="Anonymous" />);
    var result = renderer.getRenderOutput();
    t.jsxEquals(result, <ExampleComponent name="Anonymous" />, 'received original props');

    // updating
    RS1.set('user.name', 'John');
    renderer.render(<ConnectedComponent name="Anonymous" />);
    result = renderer.getRenderOutput();
    t.jsxEquals(result, <ExampleComponent name="John" />, 'receives store props');

    t.end();
});
test('connections can map state keys', (t) => {
    var RS1 = ReactiveStore();
    var trim = (x) => x && x.trim();
    
    var channel1 = Channel({
        'name': 'user.name'
    }, RS1);
    var RS2 = ReactiveStore();
    var channel2 = Channel({
        'email': 'user.email'
    }, RS2);
    var channel = channel1.merge(channel2).mapAll(trim);
    var ExampleComponent = (props) => (<div>{props.name}</div>);
    RS1.set('user.name', '  John ');
    RS2.set('user.email', '  john@example.com           ');

    // rendering
    var ConnectedComponent = channel.wrap(ExampleComponent);
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
