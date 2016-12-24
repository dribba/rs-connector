import React from 'react';

export default function Connector(Component, connection) {
    return class extends React.PureComponent {
        constructor(props) {
            super(props);

            this.hasRefs = (this.refs || []).length;
            this.isCompositeComponent = typeof Component === 'function' && Component instanceof React.Component;
            this.connection = connection;
        }
        componentWillMount() {
            this.stop = this.connection.connect((state, firstRun) => {
                if (firstRun) {
                    this.state = state;
                } else {
                    this.setState(state);
                }
            });
        }

        render() {
            var refs = this.hasRefs && this.isCompositeComponent ? {refs: this.refs} : {};
            return (<Component {...this.props} {...this.state} {...refs} />);
        }

        componentWillUnmount() {
            this.stop && this.stop();
        }
    }
}