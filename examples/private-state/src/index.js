import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './components/Counter';
import Channel from 'rs-connector';


// Backend takes an initial state and a store to manage the state overtime,
// the return object is the API that will be given to a connected component
// as props, so the component can update the internal state
const counterBackend = initialValue => store => {
  // shortcut
  const updateCounter = updateFn => {
    store.set('value', updateFn(store.get('value')));
  };

  // set initial state
  updateCounter(_ => initialValue || 0);

  // API passed to the component
  return {
    onIncrement() {
      updateCounter(counter => counter + 1);
    },
    onDecrement() {
      updateCounter(counter => counter - 1);
    } 
  };
}

// A master counter state as a channel
const masterCounterState = Channel.private('value', counterBackend());
// The component 
const MasterCounterComponent = masterCounterState.connect(Counter);
const TripleMasterComponent = masterCounterState.mapKey('value', x => x * 3).connect(Counter);

// Slave counters will track the master 
const SlaveCounter = (props) => {
  var privateStateChannel = Channel.private('value', counterBackend(props.initialValue));
  // just because
  var mergeCounterState = (privateState, masterState) => {
    return Object.assign({}, privateState, {
      value: privateState.value + masterState.value
    });
  };
  var privateCounterState = privateStateChannel.merge(props.masterChannel, mergeCounterState);
  var ConnectedCounter = privateCounterState.connect(Counter);
  return (<ConnectedCounter />);
};

const RootComponent = () => (
  <div>
    <div>
      <span>Master Counter:</span>
      <MasterCounterComponent />
    </div>
    <div>
      <span>Triple Master Counter:</span>
      <TripleMasterComponent />
    </div>
    <div>
      <span>Private Counters:</span>
      <SlaveCounter masterChannel={masterCounterState} initialValue={42} />
      <SlaveCounter masterChannel={masterCounterState} initialValue={-42} />
      <SlaveCounter masterChannel={masterCounterState} initialValue={25} />
    </div>
  </div>
);

const rootEl = document.getElementById('root');
ReactDOM.render(<RootComponent />, rootEl);