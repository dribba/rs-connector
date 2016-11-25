import connect from '../src/connect';

import ReactDOM from 'react-dom'

var test = require('tape');
var React = require('react');
var ReactiveStore = require('reactive-store');
var ReactTestUtils = require('react-addons-test-utils');

test('timing test', function (t) {
    var RS1 = ReactiveStore();
    // var RS2 = ReactiveStore();

    RS1.debug.on();

    var renderer = ReactTestUtils.createRenderer();
    var Message = (props) => (
        <div>
            <h1>Hello!</h1>
            <h2>Welcome {props.foo || "Anonymous"} to this test</h2>
        </div>
    );

    RS1.set('obj', { foo: 'bar' });
    
    var ConnectedMessage = connect('obj', RS1)(Message);

    // window.document.body.innerHTML = '<div id="container"></div>'

    // ReactDOM.render(<ConnectedMessage />, window.document.getElementById('container'));
    console.log('output = ', window.document.innerHTML);
    

    // console.log('Result: ');
    // console.dir(renderer.getRenderOutput())

    RS1.set('obj.foo', 'baz');

    console.log('RS1: ', RS1.dump());
    // console.log('RS2: ', RS2.dump());

    t.plan(2);

    t.equal(typeof Date.now, 'function');
    var start = Date.now();

    setTimeout(function () {
        console.log('output 2 = ', document.body.innerHTML);
        t.equal(Date.now() - start, 100);
    }, 1000);
});