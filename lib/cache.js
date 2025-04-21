"use strict";

const core = require('@lumjs/core');
const {F,needType} = core.types;

/**
 * A simple class for making quick cache objects.
 * 
 * As this extends the native JS `Map` class, you can use any of the
 * non-overridden methods from that class to work with cached values.
 * 
 * @exports module:@lumjs/simple-data/cache
 * @extends Map
 */
class SimpleCache extends Map
{
  /**
   * An overridden/extended version of the get() method from Map.
   * 
   * If our map entries already have a value for the specified key, this
   * acts exactly like the original get() method, and returns that value.
   * 
   * Otherwise it may use a closure to make/get the value, and then cache
   * it in our map data so it'll be used in future calls to this method.
   * 
   * @param {mixed} key - Key we want to get a (possibly cached) value for.
   * 
   * @param {function} [generator] 
   * 
   * If this is specified, and the `key` was not already cached, then get()
   * will forward it to the setWith() method.
   * 
   * Once a defined value has been cached, you may use the delete() method
   * to remove the cached version from the map entries, then subsequent calls
   * to get() will re-run the generator closure again. Useful if the source
   * of the data has changed and you need to rebuild the cached value.
   * 
   * @returns {mixed} If `key` was not cached, and `generator` was omitted,
   * then this will simply return `undefined` like the regular get() would.
   */
  get(key, generator)
  {
    if (this.has(key))
    {
      return super.get(key);
    }
    else if (typeof generator === F)
    {
      return this.setWith(key, generator);
    }
  }

  /**
   * Set a cached (Map) value via a generator closure.
   * 
   * @param {mixed} key - Key we want to set the value of.
   * 
   * @param {function} generator - Closure to generate or retreive the
   * value to set the `key` to in our cached map entries.
   * 
   * If the return value is anything other than `undefined`, then the
   * `key` will be set, overwriting any previously cached values.
   * 
   * If you want to signify the absence of a specific value, but still have
   * `this.has(key)` return `true`, that's what the `null` value is for.
   * 
   * @param {boolean} [deleteUndefined=false]
   * 
   * If `true`, then if the `generator` returns `undefined`, the `key`
   * will be deleted from the cached map entries (if it was set).
   * 
   * If `false` (the default), an `undefined` value will simply not
   * be set (so if an existing value is cached, it won't be overwritten).
   * 
   * @returns {mixed} The value from the generator.
   * @throws {TypeError} If `generator` was not a function.
   */
  setWith(key, generator, deleteUndefined=false)
  {
    needType(F, generator, 'generator must be a function');

    const val = generator.call(this, key);

    if (val !== undefined)
    {
      this.set(key, val);
    }
    else if (deleteUndefined)
    {
      this.delete(key);
    }

    return val;
  }

}

module.exports = SimpleCache;
