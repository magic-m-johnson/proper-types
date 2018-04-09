import RealPropTypes from 'prop-types'
import { setPropTypes as setRealPropTypes } from 'recompose'

// export depending on env
let Wrapper
let Types

if (process.env.NODE_ENV === 'production' && process.env.PROPER_TYPES !== 'show') {
    Wrapper = setRealPropTypes
    Types = RealPropTypes
} else {
    const transformArgs = (arg) => {
        return typeof arg === 'function' ? RealPropTypes[arg().type] : arg
    }

    Wrapper = (readableProps) => {
        let propTypes = {}
        let properTypes = {}

        function getName(args) {
            return args.displayName || args.name || args
        }

        Object.keys(readableProps)
            .sort()
            .map((p) => {
                let propType
                let properType

                const flattenArgs = (data) => {
                    return data.args.map
                        ? data.args
                            .map(
                                (v) =>
                                    typeof v === 'string'
                                        ? '"' + v + '"'
                                        : typeof v === 'function'
                                        ? v().type === 'instanceOf' ? getName(v().args) : v().type
                                        : v
                            )
                            .join(' | ')
                        : getName(data.args)
                }

                const mapArgs = (data) => {
                    return data.args.map ? data.args.map(transformArgs) : data.args
                }

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
                            propType = RealPropTypes[type](mapArgs(data)).isRequired
                            properType = flattenArgs(data)
                        } else {
                            propType = RealPropTypes[type](mapArgs(data))

                            properType = '[ ' + flattenArgs(data) + ' ]'
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
            Component.propTypes = { ...Component.propTypes, ...propTypes }
            Component.properTypes = { ...Component.properTypes, ...properTypes}

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
            const innerCbk = () => ({ type: type, args: args, required: true })
            const callback = () => ({
                type: type,
                args: args,
                isRequired: innerCbk,
            })

            callback.ptc = true
            innerCbk.ptc = true

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
