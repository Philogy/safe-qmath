const BN = require('bn.js')

// converts a javascript float into a BN representing the
const convertFloatToUQInt = (x) => {
  if (x < 0) throw Error('Number must be positive')
  let fractionalPart = x % 1
  fractionalPart = Math.round(fractionalPart * 2 ** 64)
  const integerPart = Math.round(x)

  return new BN(integerPart).shln(64).add(new BN(fractionalPart.toString()))
}

const convertUQIntToFloat = (x) => {
  return x.toArray('be', 24).reduce((a, b) => {
    return a * 256 + b * 256 ** -8
  }, 0)
}

const round = (num, places = 2) => {
  const roundedPreShift = Math.round(`${num}e+${places}`)
  return +`${roundedPreShift}e-${places}`
}

module.exports = { convertFloatToUQInt, convertUQIntToFloat, round }
