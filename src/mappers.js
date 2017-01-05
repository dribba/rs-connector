import shallowequal from 'shallowequal';

function identity(x) { return x; }

export function mapAll(fn) {
    return state => Object.keys(state).reduce((acc, key) => {
        acc[key] = fn(state[key]);
        return acc;
    }, {});
};
export function mapKey(key, fn) {
    return mapObj({
        [key]: fn
    });
};
export function mapObj(obj) {
    return state => Object.keys(state).reduce((acc, key) => {
        var fn = obj[key] || identity;
        acc[key] = fn(state[key]);
        return acc;
    }, {});
};
export function filterKey(key, fn) {
    return filterObj({
        [key]: fn
    });
};
export function filterKeys(fn) {
    return state => Object.keys(state).reduce((acc, key) => {
        fn(state[key]) ? (acc[key] = state[key]) : undefined;
        return acc;
    }, {});
};
export function filterObj(obj) {
    return state => Object.keys(state).reduce((acc, key) => {
        var fn = obj[key] || always(true);
        fn(state[key]) ? (acc[key] = state[key]) : undefined;
        return acc;
    }, {});
};
export function noDuplicates() {
    var previous;
    return state => {
        var result = previous === undefined || !shallowequal(previous, state);
        previous = state;
        return result;
    };
}