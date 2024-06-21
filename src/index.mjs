const RESULT_KEY = Symbol('result-key');
const STOPPED_EVENT = Symbol('stopped-event');

function createEvent(name, data) {
  const isDataEvent = !!data.name;
  const resultKey = data[RESULT_KEY] || 'result';
  const isNamepace = resultKey.includes('.');

  const event = {
    error: null,
    context: {},
    [RESULT_KEY]: resultKey,
    ...data,
    [resultKey]: isDataEvent ? undefined : getValue(data, resultKey),
    name,
    [STOPPED_EVENT]: false,
    defaultPrevented: false,
  };

  if (isNamepace) {
    createPath(event, resultKey);

    event[resultKey] = isDataEvent ? undefined : getValue(data, resultKey);
  }

  event.stopPropagation = () => {
    event[STOPPED_EVENT] = true;
  };

  event.preventDefault = () => {
    event.defaultPrevented = true;
  };

  return event;
}

function getValue(source, path) {
  if (path === '') {
    return source;
  }

  const keys = path.split('.');

  return keys.reduce((result, key) => {
    return result?.[key] ?? undefined;
  }, source);
}

function setValue(source, path, value) {
  const keys = path.split('.');
  const key = keys.pop();

  const result = getValue(source, keys.join('.'));

  return (result[key] = value);
}

function createPath(source, path) {
  const keys = path.split('.');
  keys.pop();

  keys.reduce((result, key) => {
    return (result[key] = result[key] ?? {});
  }, source);
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
          setValue(
            event,
            event[RESULT_KEY],
            result ?? getValue(event, event[RESULT_KEY])
          );
          if (event[STOPPED_EVENT]) {
            return getValue(event, event[RESULT_KEY]);
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
        setValue(
          event,
          event[RESULT_KEY],
          result ?? getValue(event, event[RESULT_KEY])
        );
      }
    }

    if (promise) {
      return promise.then((result) => {
        setValue(
          event,
          event[RESULT_KEY],
          result ?? getValue(event, event[RESULT_KEY])
        );

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
