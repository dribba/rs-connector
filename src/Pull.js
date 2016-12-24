function collectState(store) {
    return (state, key) => {
        state[key.stateKey] = store.get(key.storeKey);
        return state;
    };
}

export default function Pull(pull) {
    return {
        pull: pull,
        map(fn) {
            return Pull((cb) => pull(value => cb(fn(value))));
        },
        tap(fn) {
            return Pull((cb) => pull(value => {
                fn(value); 
                cb(value);
            }));
        },
        filter(fn) {
            return Pull((cb) => pull(value => fn(value) && cb(value)));
        },
        concat(other, mergeFn) {
            return Pull((cb) => {
                pull(value1 => other.pull(value2 => {
                    return cb(mergeFn(value1, value2))
                }));
            });
        }
    };
}
Pull.create = function create(keys, store) {
    return Pull((fn) => fn(keys.reduce(collectState(store), {})));
};