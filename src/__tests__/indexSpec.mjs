import { jest } from '@jest/globals';

import { Event, Emitter } from '../index';

describe('Emitter', () => {
  let emitter = null;
  const MyEvent = 'myEvent';
  const data = {};

  beforeEach(() => {
    emitter = new Emitter();
  });

  it('should add and remove listener for defined event', () => {
    const off = emitter.on(MyEvent, () => {});

    expect(emitter.listeners(MyEvent)).toHaveLength(1);
    off();
    expect(emitter.listeners(MyEvent)).toHaveLength(0);
  });

  it('should add and remove listener with off method for defined event', () => {
    const listener = () => {};

    emitter.on(MyEvent, listener);

    expect(emitter.listeners(MyEvent)).toHaveLength(1);

    emitter.off(MyEvent, listener);
    expect(emitter.listeners(MyEvent)).toHaveLength(0);
  });

  it('should emit event on defined sync listeners', async () => {
    const listener = jest.fn(({ result }) => {
      return (result ?? 0) + 1;
    });

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);

    const event = emitter.emit(MyEvent, data);

    expect(event).toMatchInlineSnapshot(`
      Object {
        "__stopped__": false,
        "context": Object {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 3,
        "stopPropagation": [Function],
      }
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Object {
              "__stopped__": false,
              "context": Object {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
            },
          ],
          Array [
            Object {
              "__stopped__": false,
              "context": Object {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
            },
          ],
          Array [
            Object {
              "__stopped__": false,
              "context": Object {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
            },
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": 1,
          },
          Object {
            "type": "return",
            "value": 2,
          },
          Object {
            "type": "return",
            "value": 3,
          },
        ],
      }
    `);
  });

  it('should emit event on defined async listeners', async () => {
    const listener = jest.fn(({ result }) => {
      return result !== undefined
        ? Promise.resolve(result + 1)
        : Promise.resolve(0 + 1);
    });
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);

    const event = await emitter.emit(MyEvent, data);

    expect(event).toMatchInlineSnapshot(`
      Object {
        "__stopped__": false,
        "context": Object {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 3,
        "stopPropagation": [Function],
      }
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Object {
              "__stopped__": false,
              "context": Object {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
            },
          ],
          Array [
            Object {
              "__stopped__": false,
              "context": Object {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
            },
          ],
          Array [
            Object {
              "__stopped__": false,
              "context": Object {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
            },
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": Promise {},
          },
          Object {
            "type": "return",
            "value": Promise {},
          },
          Object {
            "type": "return",
            "value": Promise {},
          },
        ],
      }
    `);
  });

  it('should allow stopPropagation event for sync mode to other listeners', async () => {
    const listener = jest.fn(({ stopPropagation, result }) => {
      if (result === 1) {
        stopPropagation();
      }

      return (result ?? 0) + 1;
    });

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);

    const event = emitter.emit(MyEvent, data);

    expect(event).toMatchInlineSnapshot(`
      Object {
        "__stopped__": true,
        "context": Object {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 2,
        "stopPropagation": [Function],
      }
    `);

    expect(listener.mock.calls.length).toEqual(2);
  });

  it('should allow stopPropagation event for async to other listeners', async () => {
    const listener = jest.fn(({ stopPropagation, result }) => {
      return new Promise((resolve) => {
        if (result === 1) {
          stopPropagation();
        }
        resolve((result ?? 0) + 1);
      });
    });

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);

    const event = await emitter.emit(MyEvent, data);

    expect(event).toMatchInlineSnapshot(`
      Object {
        "__stopped__": true,
        "context": Object {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 2,
        "stopPropagation": [Function],
      }
    `);

    expect(listener.mock.calls.length).toEqual(2);
  });

  it('should throw Error for sync mode from listener', () => {
    const listener = jest.fn();
    const throwListener = () => {
      throw new Error('Some');
    };

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, throwListener);
    emitter.on(MyEvent, listener);

    try {
      emitter.emit(MyEvent, data);
    } catch (error) {
      expect(listener.mock.calls.length).toEqual(1);
      expect(error.message).toEqual('Some');
    }
  });

  it('should throw Error for async mode from listener', async () => {
    const listener = jest.fn(() => Promise.resolve(1));
    const throwListener = () => {
      throw new Error('Some');
    };

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, throwListener);
    emitter.on(MyEvent, listener);

    try {
      await emitter.emit(MyEvent, data);
    } catch (error) {
      expect(listener.mock.calls.length).toEqual(1);
      expect(error.message).toEqual('Some');
    }
  });

  it('should emit event on defined listeners only once', async () => {
    const listener = jest.fn();

    emitter.once(MyEvent, listener);

    await emitter.emit(MyEvent, data);
    await emitter.emit(MyEvent, data);

    expect(listener.mock.calls.length).toEqual(1);
  });

  it('should emit event on prepend defined listeners only once', async () => {
    const listener = jest.fn();

    emitter.prependOnceListener(MyEvent, listener);

    await emitter.emit(MyEvent, data);
    await emitter.emit(MyEvent, data);

    expect(listener.mock.calls.length).toEqual(1);
  });

  it('should remove all defined listeners', () => {
    const MyEvent2 = 'MyEvent2';

    emitter.on(MyEvent, jest.fn());
    emitter.on(MyEvent, jest.fn());
    emitter.on(MyEvent, jest.fn());

    emitter.on(MyEvent2, jest.fn());
    emitter.on(MyEvent2, jest.fn());
    emitter.on(MyEvent2, jest.fn());

    emitter.removeAllListeners();

    expect(emitter.listeners(MyEvent).length).toEqual(0);
    expect(emitter.listeners(MyEvent2).length).toEqual(0);
  });

  it('should add the listener function to the beginning of the listeners array', () => {
    const listener = jest.fn();
    const throwListener = () => {
      throw new Error('Some');
    };

    emitter.on(MyEvent, listener);
    emitter.prependListener(MyEvent, throwListener);
    emitter.on(MyEvent, listener);

    try {
      emitter.emit(MyEvent, data);
    } catch (error) {
      expect(listener.mock.calls.length).toEqual(0);
      expect(error.message).toEqual('Some');
    }
  });

  it('should add once the listener function to the beginning of the listeners array', () => {
    const listener = jest.fn();
    const throwListener = () => {
      throw new Error('Some');
    };

    emitter.on(MyEvent, listener);
    emitter.prependOnceListener(MyEvent, throwListener);
    emitter.on(MyEvent, listener);

    try {
      emitter.emit(MyEvent, data);
    } catch (error) {
      expect(listener.mock.calls.length).toEqual(0);
      expect(error.message).toEqual('Some');
    }

    emitter.emit(MyEvent, data);

    expect(listener.mock.calls.length).toEqual(2);
  });
});

describe('hooks', () => {
  it('should has Emitter class', () => {
    expect(typeof Emitter === 'function').toBeTruthy();
  });

  it('should has defined base events', () => {
    expect(Event).toMatchInlineSnapshot(`
      Object {
        "Error": "@esmj/emitter.event.error",
      }
    `);
  });
});
