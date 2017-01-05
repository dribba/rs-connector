export default function Subscribe(subscribe) {
    return {
        subscribe: subscribe,
        map(fn) {
            return Subscribe(subscribe);
        },
        concat(other) {
            return Subscribe(pull => observer => {
                var ran = false;
                // Makes sure `firstRun === true` only once
                var newObserver = (value, firstRun) => {
                    firstRun && !ran && observer(value, firstRun);
                    !firstRun && observer(value, firstRun);
                    ran = true;
                }
                var subs1 = subscribe(pull)(newObserver);
                var subs2 = other.subscribe(pull)(newObserver);

                return () => {
                    subs1();
                    subs2();
                };
            });
        }
    };
}
Subscribe.create = function create(store) {
    return Subscribe(pull => observer => {
        return store.autorun(firstRun => {
            pull(value => observer(value, firstRun));
        }).stop;
    });
};
Subscribe.once = Subscribe(pull => observer => {
    pull(observer);
    return identity;
});
function identity(x) { return x; }
Subscribe.fromProducer = function fromProducer(producer) {
    return Subscribe(pull => observer => {
        return producer(observer) || identity;
    });
};