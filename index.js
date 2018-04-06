import RealPropTypes from 'prop-types'
import { setPropTypes as setRealPropTypes } from 'recompose'

// export depending on env
let Wrapper
let Types

if (process.env.NODE_ENV === 'production') {
    Wrapper = setRealPropTypes
    Types = RealPropTypes
} else {
    const transformArgs = (arg) => {
        return RealPropTypes[arg().type]
    }

    Wrapper = (readableProps) => {
        let propTypes = {}
        let properTypes = {}

        Object.keys(readableProps)
            .sort()
            .map((p) => {
            let propType
            let properType

            if (readableProps[p].ptc) {
            const data = readableProps[p]()
            const type = data.type

            if (data.args === undefined) {
                if (data.required) {
                    propType = RealPropTypes[type].isRequired
                    properType = type
                } else {
                    propType = RealPropTypes[type]
                    properType = `[ ${type} ]`
                }
            } else {
                if (data.required) {
                    propType = RealPropTypes[type](data.args.map(transformArgs)).isRequired
                    properType = data.args.map((v) => v().type).join(' | ')
                } else {
                    propType = RealPropTypes[type](data.args.map(transformArgs))
                    properType = '[ ' + data.args.map((v) => v().type).join(' | ') + ' ]'
                }
            }
        } else {
            // custom callback
            propType = p
            properType = 'function'
        }

        propTypes[p] = propType
        properTypes[p] = properType
    })

        return (Component) => {
            Component.propTypes = propTypes
            Component.properTypes = properTypes

            return Component
        }
    }

    const buildType = (type) => {
        let callback

        callback = () => ({ type: type })
        callback.isRequired = () => ({ type: type, required: true })
        callback.ptc = true
        callback.isRequired.ptc = true

        return callback
    }

    const buildArgType = (type) => {
        return (args) => {
            const callback = () => ({
                type: type,
                args: args,
                isRequired: () => ({ type: type, args: args, required: true }),
        })

            callback.ptc = true

            return callback
        }
    }

    // propTypes <-> properTypes mapping
    Types = {
        // simple types
        any: buildType('any'),
        array: buildType('array'),
        bool: buildType('bool'),
        func: buildType('func'),
        number: buildType('number'),
        object: buildType('object'),
        string: buildType('string'),
        symbol: buildType('symbol'),
        node: buildType('node'),
        element: buildType('element'),
        // types that take args
        instanceOf: buildArgType('instanceOf'),
        oneOf: buildArgType('oneOf'),
        oneOfType: buildArgType('oneOfType'),
        arrayOf: buildArgType('arrayOf'),
        objectOf: buildArgType('objectOf'),
        shape: buildArgType('shape'),
    }
}

export { Wrapper as setPropTypes, Types as PropTypes }
