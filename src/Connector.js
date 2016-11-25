var React = require('react');

export default class Connector extends React.Component {

  constructor(props) {
    super(props);
    this.store = props.store;
    this.rsKey = props.rsKey;
    this.renderFn = props.renderFn;
    this.state = {
        tick: Date.now()
    };
  }

  componentDidMount() {
    this.stop = this.store.autorun(() => {
        console.log('tick');
        this.setState({
            data: this.store.get(this.rsKey)
        });
    }).stop;
  }

  render() {
      return this.renderFn(this.state.data);
  }

  componentWillUnmount() {
      this.stop && this.stop();
  }
}