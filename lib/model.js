"use strict";

const core = require('@lumjs/core');
const {F,isObj,needObj} = core.types;
const {df} = core.obj;

const propRules = (obj) => Object.keys(obj).reduce((rules,key) => 
{
  rules[key] = {key, get: true, set: null, cache: false};
  return rules;
}, {});

/**
 * A base class for simple data models.
 * 
 * Not meant to be used as is, actual model classes should extend this and add
 * accessors and methods specific to the data model, as well as special setup
 * methods that can customize the behaviour even further.
 * 
 * Has a few special *static* accessor (getter-only) properties to configure
 * some advanced options in classes extending this.
 * 
 * @prop {(string|symbol)} cacheKey - Instance property for data caches.
 * 
 * An instance property with this name will be created as a Map, which will
 * be used for any data caching. Unlike the other _Key_ properties, 
 * this does not have an option to make the property enumerable.
 * 
 * Default: `'$cache'`
 * 
 * @prop {(string|symbol)} dataKey - Instance property for model data object.
 * 
 * An instance property with this name will always be assigned with the full
 * data object as passed to the constructor.
 * 
 * Default: `'data'`
 * 
 * @prop {(string|symbol)} parentKey - Instance property for parent object.
 * 
 * If a parent object is passed to the constructor, it will be assigned to
 * an instance property with this name.
 * 
 * Default: `'parent'`
 * 
 * @prop {(string|symbol)} setupModelKey - Model setup method.
 * 
 * If an *instance* method with this name exists, it will be called by 
 * the constructor (after all auto-generated properties are assigned), 
 * and passed all arguments (including ones other than the two used by 
 * the constructor itself). It may be used for any advanced setup purposes.
 * 
 * The method has no return value.
 * 
 * Default: `'setupModel'`
 * 
 * @prop {(string|symbol)} setupPropsKey - Property key map setup method.
 * 
 * If an *instance* method with this name exists, the constructor will pass it
 * an object with {@link module:@lumjs/simple-data/model~PropRules} properties
 * for all the string-keyed enumerable properties in the data object.
 * 
 * A really simple example with only one data property ('name'): 
 * `{"name": {key: "name", get: true, set: null, cache: false}}`
 * 
 * The method may delete properties from the passed object to not have an 
 * accessor generated for the associated data property at all, or change 
 * the property rules to easily customize the generated accessor.
 * 
 * The method has no return value.
 * 
 * Default: `'setupProps'`
 * 
 * @prop {boolean} enumerableData - Should `this[dataKey]` be enumerable?
 * Default: `false`
 * @prop {boolean} enumerableParent - Should `this[parentKey]` be enumerable?
 * Default: `false`
 * @prop {boolean} enumerableProps - Should the auto-generated data accessor
 * properties be enumerable? Default: `true`
 * 
 * @exports module:@lumjs/simple-data/model
 */
class SimpleModel 
{
  static get cacheKey          () { return '$cache'     }
  static get dataKey           () { return 'data'       }
  static get parentKey         () { return 'parent'     }
  static get setupModelKey     () { return 'setupModel' }
  static get setupPropsKey     () { return 'setupProps' }
  static get enumerableData    () { return false        }
  static get enumerableParent  () { return false        }
  static get enumerableProps   () { return true         }

  /**
   * Build a simple data model instance.
   * 
   * Only two arguments are used by the default, but you may add additional
   * arguments that are handled by the `this[this.constructor.setupModelKey]`
   * method specific to each class.
   * 
   * @param {object} data - The model data object.
   * 
   * This should be a *plain* JS object like you'd get from JSON.parse();
   * other JS classes such as `Array`, `Map`, `Set`, won't work properly.
   * I may make separate model classes for different data types later,
   * but this one is specifically for wrapping the kind of data returned
   * from a web service as a simple JSON object.
   * 
   * This will be assigned to `this[this.constructor.dataKey]` property.
   * 
   * Any string-keyed enumerable properties in this that are not overridden
   * by existing class accessors or methods, will by default have accessors
   * generated so that `this.name` will reference the `data.name` property.
   * 
   * The accessors that are auto-generated may be customized via the
   * `this[this.constructor.setupPropsKey]` method, which is passed an object
   * with {@link module:@lumjs/simple-data/model~PropRules} properties for
   * every string-keyed enumerable property in the `data` object.
   * 
   * @param {object} [parent] An optional parent object.
   * 
   * If specified, assigned to `this[this.constructor.parentKey]` property.
   * 
   */
  constructor(data, parent)
  {
    needObj(data, 'data must be an object');

    const cc = this.constructor;
    const cp = cc.cacheKey;
    const dp = cc.dataKey;

    df(this, cp, {value: new Map()});

    df(this, dp,
    {
      value: data,
      enumerable: cc.enumerableData,
    });
    
    if (isObj(parent))
    {
      df(this, cc.parentKey, 
      {
        value: parent,
        enumerable: cc.enumerableParent,
      });
    }

    const enumerable = cc.enumerableProps;
    const prules = propRules(data);

    let sk = cc.setupPropsKey;
    if (typeof this[sk] === F)
    {
      this[sk](prules);
    }

    for (const dkey in prules)
    {
      const rule = prules[dkey];
      if (!(rule.key in this))
      {
        let getter, setter;

        if (typeof rule.get === F)
        {
          getter = function() 
          { 
            if (rule.cache && this[cp].has(dkey))
            {
              return this[cp].get(dkey);
            }

            let val = rule.get(this[dp][dkey], dkey, this);
            if (rule.cache && val !== undefined)
            {
              this[cp].set(dkey, val);
            }
            return val;
          }
        }
        else if (rule.get)
        {
          getter = function() { return this[dp][dkey] }
        }

        if (typeof rule.set === F)
        {
          setter = function(val)
          {
            const rv = rule.set(val, dkey, this);
            if (rv !== undefined)
            {
              this[dp][dkey] = rv;
            }
          }
        }
        else if (rule.set || (rule.set === null && rule.get))
        {
          setter = function(val) { this[dp][dkey] = val; }
        }

        if (getter || setter)
        {
          df(this, rule.key, 
          {
            get: getter,
            set: setter,
            enumerable,
          });
        }
      }
    }

    sk = cc.setupModelKey;
    if (typeof this[sk] === F)
    {
      this[sk](...arguments);
    }

  }
}

SimpleModel.propRules = propRules;

module.exports = SimpleModel;

/**
 * Data property accessor rules.
 * 
 * @typedef {object} module:@lumjs/simple-data/model~PropRules
 * 
 * @prop {string} key - The name to be used for the accessor property.
 * 
 * Default: the same name as the associated property in the data object.
 * 
 * @prop {boolean} cache
 * 
 * If this is `true` then the results of a getter function will be cached
 * for future calls. Only applicable if `get` is a function.
 * 
 * You can use `model[cacheKey].remove(key)` or `model[cacheKey].clear()`
 * to remove cached getter results.
 * 
 * Default: `false`
 * 
 * @prop {(boolean|function)} get 
 * 
 * If this is `true` the default getter will simply return the associated 
 * property from the data object as-is.
 * 
 * If this is `false`, no getter will be assigned at all. This is the
 * quickest way to skip creating an accessor property, as by default if
 * this is false and the `set` property has not been overridden, no
 * setter will be assigned either.
 * 
 * If this is a `function`, it will be used as a
 * {@link module:@lumjs/simple-data/model~GetterFun} method.
 * In this case the `cache` property may be set in order to cache the
 * result of the getter and re-use that value going forward.
 * 
 * Default: `true`
 * 
 * @prop {(boolean|function|null)} set
 * 
 * If this is `true` the default setter will set the associated property
 * in the data object to the assigned value, as-is.
 * 
 * If this is `false`, no setter will be assigned at all, which is the
 * best way to make a *read-only* accessor property.
 * 
 * If this is a `function`, it will be used as a
 * {@link module:@lumjs/simple-data/model~SetterFun} method.
 * 
 * If this is `null` then it will be resolved as `(this.get === true)`.
 *
 * Default: `null`
 * 
 */

/**
 * Data property getter value converter
 * 
 * @callback module:@lumjs/simple-data/model~GetterFun
 * @this module:@lumjs/simple-data/model~PropRules
 * 
 * @param {mixed}  val - The value of the property in the data object
 * @param {string} key - The name of the property in the data object
 * @param {module:@lumjs/simple-data/model} model - Model instance object
 * 
 * @returns {mixed} Value to be returned by the property getter
 */

/**
 * Data property setter value converter *OR* assignment handler
 * 
 * @callback module:@lumjs/simple-data/model~SetterFun
 * @this module:@lumjs/simple-data/model~PropRules
 * 
 * @param {mixed}  val - The value assigned to the accessor property
 * @param {string} key - The name of the property in the data object
 * @param {module:@lumjs/simple-data/model} model - Model instance object
 * 
 * @returns {mixed} If the return value is anything other than `undefined`,
 * it will be assigned to the associated property (`model.data[key]`).
 * 
 * If the value is undefined, it is assumed that the method performed
 * the assignment itself, or that no assignment should be done in this case.
 */
