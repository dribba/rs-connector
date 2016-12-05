import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './components/Counter';
import ReactiveStore from 'reactive-store';
import connect from 'rs-connector';

const RS = ReactiveStore();
const updateCounter = newVal => RS.set('counter', newVal);

// init counter value
updateCounter(0);

const increment = current => () => updateCounter(current + 1);
const decrement = current => () => updateCounter(current - 1);

const connection = connect('counter', RS);
const RootComponent = connection.wrap(({counter}) => (
  <Counter
    value={counter}
    onIncrement={increment(counter)}
    onDecrement={decrement(counter)}
  />
));

const rootEl = document.getElementById('root');
ReactDOM.render(<RootComponent />, rootEl);