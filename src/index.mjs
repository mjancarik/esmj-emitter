const RESULT_KEY = Symbol('result-key');
const STOPPED_EVENT = Symbol('stopped-event');

function createEvent(name, data) {
  const isDataEvent = !!data.name;
  const resultKey = data[RESULT_KEY] || 'result';

  const event = {
    error: null,
    context: {},
    [RESULT_KEY]: 'result',
    ...data,
    [resultKey]: isDataEvent ? undefined : data[resultKey],
    name,
    [STOPPED_EVENT]: false,
    defaultPrevented: false,
  };

  event.stopPropagation = () => {
    event[STOPPED_EVENT] = true;
  };

  event.preventDefault = () => {
    event.defaultPrevented = true;
  };

  return event;
}

class Emitter {
  constructor({ logger, debug } = {}) {
    this._logger = logger ?? console;
    this._debug = debug ?? false;

    this._events = new Map();

    // ALIASES
    this.addListener = this.on;
    this.removeListener = this.off;
  }

  emit(eventName, data = {}) {
    const methods = this.listeners(eventName);
    const event = createEvent(eventName, data);
    let promise = null;
    let result = null;

    if (this._debug) {
      typeof this._debug === 'function'
        ? this._debug(eventName, event)
        : this._logger.debug(`Event name: ${eventName}, event: ${event}`);
    }

    for (const method of methods) {
      if (promise) {
        promise = promise.then((result) => {
          event[event[RESULT_KEY]] = result ?? event[event[RESULT_KEY]];
          if (event[STOPPED_EVENT]) {
            return event[event[RESULT_KEY]];
          }

          return method(event);
        });
      }

      if (!promise) {
        if (event[STOPPED_EVENT]) {
          return event;
        }

        result = method(event);
      }

      if (result instanceof Promise && !promise) {
        promise = result;
      } else {
        event[event[RESULT_KEY]] = result ?? event[event[RESULT_KEY]];
      }
    }

    if (promise) {
      return promise.then((result) => {
        event[event[RESULT_KEY]] = result ?? event[event[RESULT_KEY]];

        return event;
      });
    }

    return event;
  }

  listeners(eventName) {
    if (!this._events.has(eventName)) {
      return [];
    }

    return [...this._events.get(eventName)];
  }

  removeAllListeners(eventName) {
    if (!eventName) {
      return Array.from(this._events.keys()).forEach((eventName) =>
        this.removeAllListeners(eventName)
      );
    }

    return this.listeners(eventName).forEach((handler) =>
      this.off(eventName, handler)
    );
  }

  _addListener(eventName, method, action) {
    if (!this._events.has(eventName)) {
      this._events.set(eventName, []);
    }

    const methods = this._events.get(eventName);
    methods[action](method);

    return () => {
      this.off(eventName, method);
    };
  }

  on(eventName, method) {
    return this._addListener(eventName, method, 'push');
  }

  prependListener(eventName, method) {
    return this._addListener(eventName, method, 'unshift');
  }

  _addListenerOnce(eventName, method, action) {
    let removeMethod = this[action](eventName, (event) => {
      removeMethod();
      return method(event);
    });
  }

  once(eventName, method) {
    return this._addListenerOnce(eventName, method, 'on');
  }

  prependOnceListener(eventName, method) {
    return this._addListenerOnce(eventName, method, 'prependListener');
  }

  off(eventName, method) {
    if (this._events.has(eventName)) {
      const methods = this._events.get(eventName);
      const index = methods.indexOf(method);

      methods.splice(index, 1);
    }
  }
}

export { createEvent, Emitter, RESULT_KEY };
