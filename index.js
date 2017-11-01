const Layer = require('express/lib/router/layer');

const wrapErrorMiddleware = fn => (err, req, res, next) => {
  Promise.resolve(fn(err, req, res, next))
    .catch(next);
};

const wrap = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};

Object.defineProperty(Layer.prototype, 'handle', {
  enumerable: true,
  get() { return this.__handle; },
  set(fn) {
    // Bizarre, but Express checks for 4 args to detect error middleware: https://github.com/expressjs/express/blob/master/lib/router/layer.js
    if (fn.length === 4) {
      fn = wrapErrorMiddleware(fn);
    } else {
      fn = wrap(fn);
    }

    this.__handle = fn;
  },
});
