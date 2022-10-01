export default class EventEmitter {
    events = {};

    on(eventName, fn) {
        if (this.events[eventName]?.length) this.events[eventName].push(fn);

        this.events[eventName] = [fn];
    }

    emit(eventName, ...payload) {
        if (this.events[eventName]?.length)
            this.events[eventName].forEach((fn) => {
                fn(...payload);
            });
    }
}
