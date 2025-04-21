# lum.simple-data.js

Some classes for working with simple data structures.

## Exports

### `@lumjs/simple-data`

This simply re-exports the classes from the `model` and `cache` modules
as `Model` and `Cache` respectively. It's a quick way to get all of the
currently exported modules in a single import.

### `@lumjs/simple-data/model`

A *base class* for building data models in a way that is at least slightly
less convoluted than the [@lumjs/proxy-model] package. Classes extending this
simply generate (customizable) accessor properties on instances.

Unlike the aforementioned package, this does not include any pre-defined
type converters, but using functions from the [@lumjs/mongo-utils] package
(or similar libraries) is fairly easy to set up by adding explicit accessors
to your model classes, or by using an optional `setupProps()` method.

At some point I plan to make an optional *property accessor factory*, 
as well as some plugin packages to make the process of defining customized
accessors even easier than it already is.

To give an idea of how much simpler the code is, over half the lines in the
main class file are *documentation comments*!

### `@lumjs/simple-data/cache`

An extremely minimalist class for making simple data caches.

This extends the JS `Map` class, overriding the `get()` method so that you
can specify a closure function that will return a value to be cached if the
specified key was not already found in the map entries. That's it! If you
want more features than that, you can write a class that extends this.

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.simple-data.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/simple-data)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

[@lumjs/proxy-model]: https://github.com/supernovus/lum.proxy-model.js
