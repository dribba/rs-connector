var React = require('react');



function createConnections(connections) {
    if (!(connections instanceof Array)) throw new Error('Unsupported type');

    var toUniqueStores = (stores, conn) => {
        if (stores.indexOf(conn.store) === -1)
            return stores.concat(conn.store);
        else
            return stores;
    }
    var toConnectedStore = (store) => {
    }
    var stores = connections.reduce(toUniqueStores, []);
    var keys = connections.

    stores.map(toConnectedStore)
    return flatMap(connections, ([rsKey, rsStore]) => {
        var storeKeys = resolveKeys(rsKey);

        return storeKeys.map(([stateKey, storeKey]) => {
            return Connection(stateKey, storeKey, rsStore);
        });
    });
}

function connectStores(connectedStores, init, update) {
    var stopAllFns = [];
    var initState = connectedStores.reduce((initialState, connection) => {
        var firstRun = true;
        var stop = connection.store.autorun(() => {
            var newState = connection.keys.reduce((accState, keyConnect) => {
                if (firstRun && keyConnect.stateKey in initialState) {
                    console.warn(`Store key ${keyConnect.stateKey} is connected to two different stores and will be overwritten.`);
                }
                console.log("get =" + keyConnect.storeKey);
                var value = connection.store.get(keyConnect.storeKey);

                firstRun && (initialState[keyConnect.stateKey] = value);
                accState[keyConnect.stateKey] = value;

                return accState;
            }, {});

            // Update => setState only in new updates of each store
            if (firstRun) {
                firstRun = false;
            } else {
                update(newState);
            }
        }).stop;
        stopAllFns.push(stop);

        return initialState;
    }, {});
    init(initState);

    return () => {
        stopAllFns.forEach(fn => fn());
    };
}

export default function Connector(Component, connections) {
    return class extends React.Component {
        constructor(props) {
            super(props);

            this.hasRefs = (this.refs || []).length;
            this.isCompositeComponent = typeof Component === 'function' && Component instanceof React.Component;

            this.stop = connectStores(connections || [], initial => {
                console.log('initial =' + JSON.stringify(initial));
                this.state = initial;
            }, updated => {
                console.log('update =' + JSON.stringify(updated));
                this.setState(updated);
            });
            console.log('after');
        }

        render() {
            var refs = this.hasRefs && this.isCompositeComponent ? {refs: this.refs} : {};
            var props = Object.assign({}, this.state, this.props, refs);
            console.log('props: ');
            console.log(JSON.stringify(props));
            return (<Component {...props} />);
        }

        componentWillUnmount() {
            this.stop && this.stop();
        }
    }
}