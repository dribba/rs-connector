import React from 'react';
import { createRenderer } from 'react-addons-test-utils';

import tape from 'tape';
import addAssertions from 'extend-tape';
import jsxEquals from 'tape-jsx-equals';

import ReactiveStore from 'reactive-store';
import Connector from '../src/Connector';

const test = addAssertions(tape, {jsxEquals});

const SimplePureComponent = (props) => (
    <div>{props.name || ""}</div>
);

test.skip('rendering a simple component', function (t) {
    var ConnectedComponent = Connector(SimplePureComponent, {
        connect(init, update) {
            init({});
        }
    });

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