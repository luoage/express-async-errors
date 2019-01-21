var Layer = require('express/lib/router/layer');
var Router = require('express/lib/router');

var last = function(arr) {
  arr = arr || [];
  return arr[arr.length - 1];
};
var noop = Function.prototype;

function copyFnProps(oldFn, newFn) {
  Object.keys(oldFn).forEach(function(key) {
    newFn[key] = oldFn[key];
  });
  return newFn;
}

function wrap(fn) {
  var newFn = function newFn() {
    var args = Array.prototype.slice.call(arguments);
    var ret = fn.apply(this, args);
    var next = (args.length === 5 ? args[2] : last(args)) || noop;
    if (ret && ret.catch) ret.catch(function(err) {
      next(err);
    });
    return ret;
  };
  Object.defineProperty(newFn, 'length', {
    value: fn.length,
    writable: false,
  });
  return copyFnProps(fn, newFn);
}

function patchRouterParam() {
  var originalParam = Router.prototype.constructor.param;
  Router.prototype.constructor.param = function param(name, fn) {
    fn = wrap(fn);
    return originalParam.call(this, name, fn);
  };
}

Object.defineProperty(Layer.prototype, 'handle', {
  enumerable: true,
  get: function() {
    return this.__handle;
  },
  set: function(fn) {
    fn = wrap(fn);
    this.__handle = fn;
  },
});

patchRouterParam();
