# Emitter

The `@esmj/emitter` is tiny async event emitter library.

It works in Node.js and the browser (using a bundler like webpack).

## Requirements

- Node 18+

## Install

```shell
npm install @esmj/emitter
```

## Usage

It works for both Javascript modules (ESM and CJS).

```javascript
import { Emitter } from '@esmj/emitter';

const emitter = new Emitter();

emitter.on('some-event', async (event) => {
  return 2 * event.value;
});

const result = await emitter.emit('some-event', { value: 1 });

console.log(result); // 2

```

## API
### emitter = new Emitter(options?)

Create a new instance of Emitter.

#### options?

Type: `object`

Configure the new instance of Emitter.

##### logger?

Type: `object`
Default: `console`

Configure the logger for this instance.

##### debug?

Type: `boolean|function(eventName, event)`
Default: `false`

Configure the debugging options for this instance.

#### on(eventName, listener) / addListener(eventName, Listener)
Subscribe listener for event.

Returns an unsubscribe method.

#### off(eventName, listener) / removeListener(eventName, Listener)
Remove subscription.

#### once(eventName, listener)
Subscribe event for listener only once. It will be unsubscribed after the first call.

#### emit(eventName, data?)

Trigger an event asynchronously/synchronously. It is depends on returns value from listener. Listeners are called in the order they were added and executed serially.