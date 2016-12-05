import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './components/Counter';
import ReactiveStore from 'reactive-store';
import Channel from 'rs-connector';

const RS = ReactiveStore();
const updateCounter = newVal => RS.set('counter', newVal);

// init counter value
updateCounter(0);

const increment = () => updateCounter(RS.get('counter') + 1);
const decrement = () => updateCounter(RS.get('counter') - 1);

const channel = Channel('counter', RS);
const RootComponent = channel.connect(({counter}) => (
  <Counter
    value={counter}
    onIncrement={increment}
    onDecrement={decrement}
  />
));

const rootEl = document.getElementById('root');
ReactDOM.render(<RootComponent />, rootEl);