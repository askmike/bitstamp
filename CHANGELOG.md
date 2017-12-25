# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.1] - 2017-12-24
### Added
-Add file CHANGELOG.md and move changelog from README.md there.
-config file for example.js

### Changed
-migrate code to ES6 syntax.
-Replace callbacks with await/async and promises.
-Update required node version to v8 minimum.

## [1.1.0] - 2017-12-24
### Added
-configurable host

## [1.0.4] - 2017-09-17
### Added
-xrp_withdrawal

## [0.3.0] - 2016-06-11
### Added
- Support for API v2.
API v2 is introduced, you now need to pass the market you are interested in. Note that some API calls have changed [and](https://www.bitstamp.net/api/):

> Please note that API v2 endpoints rounding is different, than the one used on the old endpoints.

## [0.1.0] - 2013-10-31

### Changed
-The whole private API authentication process looks different now. The result is that you have to provide different information to Bitstamp (generate an API key, provide key, secret and client ID the last is your Bitstamp user ID). Check out the new examples in `example.js`.

[Unreleased]: https://github.com/13pass/bitstamp/compare/v2.0.1...HEAD
