import Connector from '../src/Connector';
import connect from '../src/connect';

import ReactDOM from 'react-dom'

var test = require('tape');
var React = require('react');
var ReactiveStore = require('reactive-store');
var ReactTestUtils = require('react-addons-test-utils');

test('timing test', function (t) {
    var RS1 = ReactiveStore();
    var RS2 = ReactiveStore();

    RS2.set('tick', 0);

    RS1.debug.on();

    var renderer = ReactTestUtils.createRenderer();

    var signUserIn = () => {
        RS1.set('user.name', 'Crystal');
    };
    var Message = (props) => (
        <div>
            <h1>Hello!</h1>
            <h2>Welcome {props.user.name || "Anonymous"} to this test</h2>
            <h2>Time here: {props.tick || 0} seconds</h2>
            <button onClick={ signUserIn }>Sign In</button>
        </div>
    );

    RS1.set('user', { name: null });
    
    var timeConnect = connect('tick', RS2);
    var ConnectedMessage = connect('user', RS1).merge(timeConnect).toComponent(Message);

    var body = window.document.body;

    var div = document.createElement("div");
    div.id = 'container';

    body.appendChild(div);

    ReactDOM.render(<ConnectedMessage />, window.document.getElementById('container'));
    // console.log('output = ', window.document.innerHTML);
    

    // console.log('Result: ');
    // console.dir(renderer.getRenderOutput())

    // setInterval(() => {RS2.set('tick', RS2.get('tick') +1)}, 1000);

    console.log('RS1: ', RS1.raw());
    // console.log('RS2: ', RS2.dump());

    // t.plan(2);

    // t.equal(typeof Date.now, 'function');
    // var start = Date.now();

    // setTimeout(function () {
        // RS1.set('user.name', 'Crystal');
        // console.log('output 2 = ', document.body.innerHTML);
        // t.equal(Date.now() - start, 100);
    // }, 1000);
});