# <img src='https://github.com/magic-m-johnson/proper-types/raw/master/logo.png' title='properTypes' />

A wrapper for making propTypes more useful in DEV environments

## Requirements

    prop-types: ^15.6.1
    recompose: ^0.26.0

## Installation

`yarn add --dev proper-types`

## Usage

Instead of using `PropTypes` and `setPropTypes` from `prop-types` and `recompose` import them from `proper-types`

`import { PropTypes, setPropTypes } from './properTypes'`

## Example

    compose(
        setDisplayName('MyComponent'),
        setPropTypes({
            someTextProp: PropTypes.string,
            someOtherProp: PropTypes.object
        })
    )(MyCompoment)

    ...
        
    MyComponent.properTypes = /* very nice and readable type definitions */ ;)