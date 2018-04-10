import RealPropTypes from 'prop-types'
import { setPropTypes as setRealPropTypes, getContext as getRealContext, withContext as withRealContext } from 'recompose'

// export depending on env
let setPropTypes
let PropTypes
let getContext
let withContext

const loop = (object, callback) => {
    for (let i in object) {
        object.hasOwnProperty(i) && callback(i, object[i])
    }
}

const mapArgs = (args) => {
    if (typeof args !== 'object') {
        return args
    }

    let mappedArgs = args.length !== undefined ? [] : {}

    loop(args, (key, arg) => {
        if (arg && arg.ptc) {
            if (RealPropTypes[arg.type]) {
                let realArg

                if (arg.args) {
                    realArg = RealPropTypes[arg.type](...mapArgs(arg.args))
                } else {
                    realArg = RealPropTypes[arg.type]
                }

                if (arg.required) {
                    realArg = realArg.isRequired
                }

                mappedArgs[key] = realArg
            } else {
                throw new Error(`Unknown propType ${arg.type}`)
            }

        } else {
            mappedArgs[key] = typeof arg !== 'object' ? arg : mapArgs(arg)
        }
    })

    return mappedArgs
}

if (process.env.NODE_ENV === 'production' && process.env.PROPER_TYPES !== 'show') {
    setPropTypes = setRealPropTypes
    PropTypes = RealPropTypes
    getContext = getRealContext
    withContext = withRealContext
} else {
    setPropTypes = (properProps) => (Component) => {
        let propTypes = {}
        let properTypes = {}

        loop(properProps, (key, prop) => {
            let propType = {}

            if (!prop || !prop.ptc) {
                propTypes[key] = prop
                properTypes[key] = prop === null ? 'null' : typeof prop
            } else if (RealPropTypes[prop.type]) {
                if (prop.args) {
                    propType = RealPropTypes[prop.type](...mapArgs(prop.args))
                } else {
                    propType = RealPropTypes[prop.type]
                }

                if (prop.required) {
                    propType = propType.isRequired
                }

                propTypes[key] = propType
                properTypes[key] = { ...prop }
            } else {
                throw new Error(`Unknown propType ${prop.type}`)
            }
        })


        Component.propTypes = { ...Component.propTypes, ...propTypes }
        Component.properTypes = { ...Component.properTypes, ...properTypes }

        return Component
    }

    const buildType = (type) => {
        let reply = { type, ptc: true }
        return { ...reply, isRequired: { ...reply, required: true } }
    }

    const buildArgType = (type) => {
        return (...args) => {
            let reply = { type, args, ptc: true }
            return { ...reply, isRequired: { ...reply, required: true } }
        }
    }

    getContext = (...context) => getRealContext(...mapArgs(context))
    withContext = (...context) => withRealContext(...mapArgs(context))

    // propTypes <-> properTypes mapping
    PropTypes = {
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

export { setPropTypes, PropTypes, getContext, withContext }
