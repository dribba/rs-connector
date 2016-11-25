import React from 'react';

import Connector from './Connector';

export default function connect(rsKey, store) {
    return (Component) => {
        var render = (props) => (<Component {...props} />);
        return (parentProps) => (<Connector store={store} renderFn={render} rsKey={rsKey} />);
    }  
}