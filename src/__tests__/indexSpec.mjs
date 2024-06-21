import { jest } from '@jest/globals';

import { Emitter, RESULT_KEY } from '../index';

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
      {
        "context": {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 3,
        "stopPropagation": [Function],
        Symbol(result-key): "result",
        Symbol(stopped-event): false,
      }
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": [
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": 1,
          },
          {
            "type": "return",
            "value": 2,
          },
          {
            "type": "return",
            "value": 3,
          },
        ],
      }
    `);
  });

  it('should emit event from event where event result is cleared between emits', async () => {
    const listener = jest.fn(({ result }) => {
      return (result ?? 0) + 1;
    });

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);

    const event1 = emitter.emit(MyEvent, data);
    const event2 = emitter.emit(MyEvent, event1);

    expect(event1).toMatchInlineSnapshot(`
      {
        "context": {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 3,
        "stopPropagation": [Function],
        Symbol(result-key): "result",
        Symbol(stopped-event): false,
      }
    `);
    expect(event2).toMatchInlineSnapshot(`
      {
        "context": {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 3,
        "stopPropagation": [Function],
        Symbol(result-key): "result",
        Symbol(stopped-event): false,
      }
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": [
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": 1,
          },
          {
            "type": "return",
            "value": 2,
          },
          {
            "type": "return",
            "value": 3,
          },
          {
            "type": "return",
            "value": 1,
          },
          {
            "type": "return",
            "value": 2,
          },
          {
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
      {
        "context": {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 3,
        "stopPropagation": [Function],
        Symbol(result-key): "result",
        Symbol(stopped-event): false,
      }
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": [
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "result": 3,
              "stopPropagation": [Function],
              Symbol(result-key): "result",
              Symbol(stopped-event): false,
            },
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": Promise {},
          },
          {
            "type": "return",
            "value": Promise {},
          },
          {
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
      {
        "context": {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 2,
        "stopPropagation": [Function],
        Symbol(result-key): "result",
        Symbol(stopped-event): true,
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
      {
        "context": {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": 2,
        "stopPropagation": [Function],
        Symbol(result-key): "result",
        Symbol(stopped-event): true,
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
    expect(listener.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "context": {},
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "result": undefined,
        "stopPropagation": [Function],
        Symbol(result-key): "result",
        Symbol(stopped-event): false,
      }
    `);
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

  it('should emit event on defined sync listeners with custom result key', async () => {
    const listener = jest.fn(({ count }) => {
      count++;

      return count;
    });

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);

    const event = emitter.emit(MyEvent, {
      ...data,
      [RESULT_KEY]: 'count',
      count: 0,
    });

    expect(event).toMatchInlineSnapshot(`
      {
        "context": {},
        "count": 4,
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "stopPropagation": [Function],
        Symbol(result-key): "count",
        Symbol(stopped-event): false,
      }
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": [
          [
            {
              "context": {},
              "count": 4,
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              Symbol(result-key): "count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "count": 4,
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              Symbol(result-key): "count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "count": 4,
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              Symbol(result-key): "count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "count": 4,
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              Symbol(result-key): "count",
              Symbol(stopped-event): false,
            },
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": 1,
          },
          {
            "type": "return",
            "value": 2,
          },
          {
            "type": "return",
            "value": 3,
          },
          {
            "type": "return",
            "value": 4,
          },
        ],
      }
    `);
  });

  it('should emit event on defined sync listeners with deep structure of custom result key', async () => {
    const listener = jest.fn(
      ({
        deep: {
          structure: { count },
        },
      }) => {
        count++;

        return count;
      }
    );

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);

    const event = emitter.emit(MyEvent, {
      ...data,
      [RESULT_KEY]: 'deep.structure.count',
      deep: {
        structure: {
          count: 0,
        },
      },
    });

    expect(event).toMatchInlineSnapshot(`
      {
        "context": {},
        "deep": {
          "structure": {
            "count": 4,
          },
        },
        "deep.structure.count": 0,
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "stopPropagation": [Function],
        Symbol(result-key): "deep.structure.count",
        Symbol(stopped-event): false,
      }
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": [
          [
            {
              "context": {},
              "deep": {
                "structure": {
                  "count": 4,
                },
              },
              "deep.structure.count": 0,
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              Symbol(result-key): "deep.structure.count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "deep": {
                "structure": {
                  "count": 4,
                },
              },
              "deep.structure.count": 0,
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              Symbol(result-key): "deep.structure.count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "deep": {
                "structure": {
                  "count": 4,
                },
              },
              "deep.structure.count": 0,
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              Symbol(result-key): "deep.structure.count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "deep": {
                "structure": {
                  "count": 4,
                },
              },
              "deep.structure.count": 0,
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              Symbol(result-key): "deep.structure.count",
              Symbol(stopped-event): false,
            },
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": 1,
          },
          {
            "type": "return",
            "value": 2,
          },
          {
            "type": "return",
            "value": 3,
          },
          {
            "type": "return",
            "value": 4,
          },
        ],
      }
    `);
  });

  it('should emit event on defined sync listeners with missing deep structure of custom result key', async () => {
    const listener = jest.fn(({ structure }) => {
      if (!structure.count) {
        structure.count = 0;
      }

      structure.count++;

      return structure.count;
    });

    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);
    emitter.on(MyEvent, listener);

    const event = emitter.emit(MyEvent, {
      ...data,
      [RESULT_KEY]: 'structure.count',
      deep: {
        structure: {
          count: 0,
        },
      },
    });

    expect(event).toMatchInlineSnapshot(`
      {
        "context": {},
        "deep": {
          "structure": {
            "count": 0,
          },
        },
        "defaultPrevented": false,
        "error": null,
        "name": "myEvent",
        "preventDefault": [Function],
        "stopPropagation": [Function],
        "structure": {
          "count": 4,
        },
        "structure.count": undefined,
        Symbol(result-key): "structure.count",
        Symbol(stopped-event): false,
      }
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": [
          [
            {
              "context": {},
              "deep": {
                "structure": {
                  "count": 0,
                },
              },
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              "structure": {
                "count": 4,
              },
              "structure.count": undefined,
              Symbol(result-key): "structure.count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "deep": {
                "structure": {
                  "count": 0,
                },
              },
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              "structure": {
                "count": 4,
              },
              "structure.count": undefined,
              Symbol(result-key): "structure.count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "deep": {
                "structure": {
                  "count": 0,
                },
              },
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              "structure": {
                "count": 4,
              },
              "structure.count": undefined,
              Symbol(result-key): "structure.count",
              Symbol(stopped-event): false,
            },
          ],
          [
            {
              "context": {},
              "deep": {
                "structure": {
                  "count": 0,
                },
              },
              "defaultPrevented": false,
              "error": null,
              "name": "myEvent",
              "preventDefault": [Function],
              "stopPropagation": [Function],
              "structure": {
                "count": 4,
              },
              "structure.count": undefined,
              Symbol(result-key): "structure.count",
              Symbol(stopped-event): false,
            },
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": 1,
          },
          {
            "type": "return",
            "value": 2,
          },
          {
            "type": "return",
            "value": 3,
          },
          {
            "type": "return",
            "value": 4,
          },
        ],
      }
    `);
  });
});

describe('hooks', () => {
  it('should has Emitter class', () => {
    expect(typeof Emitter === 'function').toBeTruthy();
  });
});
