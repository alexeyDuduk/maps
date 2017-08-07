define([], () => {
    'use strict';

    class EventManager {
        constructor() {
            this._subscriptions = {};
        }

        on(eventName, callback) {
            this._subscriptions[eventName] = this._subscriptions[eventName] || [];
            this._subscriptions[eventName].push(callback);
        }

        off(eventName, callback) {
            let callbacks = this._subscriptions[eventName];
            if (!callbacks) {
                return;
            }
            let index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }

        emit(eventName, payload) {
            let callbacks = this._subscriptions[eventName];
            if (callbacks && callbacks.length) {
                callbacks.forEach(callback => callback(payload));
            }
        }
    }

    return new EventManager();
});
