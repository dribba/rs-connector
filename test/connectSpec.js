import Connector from '../src/Connector';
import connect from '../src/connect';

import ReactDOM from 'react-dom'

var test = require('tape');
var React = require('react');
var ReactiveStore = require('reactive-store');
var ReactTestUtils = require('react-addons-test-utils');

test('api', (t) => {
    // Multiple stores, multiple connects
    var stocksConnect = connect('stocks', stocksStore);
    var weatherConnect = connect('weather', weatherStore);
    var currencyConnect = connect('currency', currencyStore);

    var stocksAndWeather = stocksConnect.merge(weatherConnect);

    var ConnectedWidget1 = stocksAndWeather.merge(currencyConnect).renderComponent(Widget1);
    var ConnectedWidget2 = stocksAndWeather.renderComponent(Widget2);


    // Multiple stores, multiple connects
    var connectAll = connect(['stocks', 'weather', 'currency'], globalStore);
    var ConnectedWidget1 = connectAll.renderComponent(Widget1);
});




