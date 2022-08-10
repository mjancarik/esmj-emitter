function createEvent(name, data) {
  const event = {
    name,
    result: undefined,
    error: null,
    context: {},
    __stopped__: false,
    defaultPrevented: false,
    ...data,
  };

  event.stopPropagation = () => {
    event.__stopped__ = true;
  };

  event.preventDefault = () => {
    event.defaultPrevented = true;
  };

  return event;
}

function catchError(emitter, method) {
  return (argument) => {
    try {
      let result = method(argument);

      if (result instanceof Promise) {
        result = result
          .catch((error) => {
            return emitter.emitUnsafe(Event.Error, {
              ...argument,
              error,
            });
          })
          .catch((criticalError) => {
            emitter._logger.error(criticalError);
            return {
              ...argument,
              error: criticalError,
              criticalError: criticalError,
            };
          });
      }

      return result;
    } catch (error) {
      try {
        return emitter.emitUnsafe(Event.Error, {
          ...argument,
          error,
        });
      } catch (criticalError) {
        emitter._logger.error(criticalError);
        return {
          ...argument,
          error: criticalError,
          criticalError: criticalError,
        };
      }
    }
  };
}

class Emitter {
  constructor({ logger } = {}) {
    this._logger = logger ?? console;

    this._events = new Map();

    // ALIASES
    this.addListener = this.on;
    this.removeListener = this.off;
  }

  emit(eventName, data) {
    const methods = this.listeners(eventName);
    const event = createEvent(eventName, data);
    let promise = null;
    let result = null;

    for (const method of methods) {
      if (promise) {
        promise = promise.then((result) => {
          event.result = result ?? event.result;
          if (event.__stopped__) {
            return event.result;
          }

          return method(event);
        });
      }

      if (!promise) {
        if (event.__stopped__) {
          return;
        }

        result = method(event);
      }

      if (result instanceof Promise && !promise) {
        promise = result;
      } else {
        event.result = result ?? event.result;
      }
    }

    if (promise) {
      return promise.then((result) => {
        event.result = result ?? event.result;

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
    let removeMethod = this[action](eventName, () => {
      removeMethod();
      return method();
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

const Event = {
  Error: '@esmj/emitter.event.error',
};

export { Event, createEvent, catchError, Emitter };
