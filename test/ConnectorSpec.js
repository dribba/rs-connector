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

const SimplePureComponent = (props) => (
    <div>{props.name || ""}</div>
);

test('rendering a simple component', function (t) {
    var ConnectedComponent = Connector(SimplePureComponent, []);

    // simple prop
    var renderer = createRenderer();
    renderer.render(<ConnectedComponent name="Anonymous" />);
    var result = renderer.getRenderOutput();
    t.jsxEquals(result, (<SimplePureComponent name="Anonymous" />), 'simple prop');

    renderer = createRenderer();
    renderer.render(<ConnectedComponent ref={(ref) => {  }} />);
    result = renderer.getRenderOutput();
    t.jsxEquals(result, (<SimplePureComponent />), 'pure components don\'t receive refs');
    t.end();
});