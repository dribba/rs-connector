import Pull from './Pull';
import Subscribe from './Subscribe';

export default function Connection(pull, subscribe) {
    return {
        pull: pull,
        subscribe: subscribe,
        map(fn) {
            return Connection(pull.map(fn), subscribe.map(fn));
        },
        tap(fn) {
            return Connection(pull.map(fn), subscribe.map(fn));
        },
        filter(fn) {
            return Connection(pull.filter(fn), subscribe);
        },
        concat(other, mergeFn) {
            var fn = mergeFn || ((a, b) => Object.assign({}, a, b));
            var newPull = pull.concat(other.pull, fn);
            var newSubscribe = subscribe.concat(other.subscribe);

            return Connection(newPull, newSubscribe);
        },
        connect(observer) {
            return subscribe.subscribe(pull.pull)(observer);
        }
    };
}
Connection.create = function(store, keys) {
    var pull = Pull.create(keys, store);
    var subscribe = Subscribe.create(store);
    return Connection(pull, subscribe);
};