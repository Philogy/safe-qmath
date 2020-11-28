import BN from 'bn.js'

export default {
  // converts a javascript float into a BN representing the
  convertFloatToUQInt(x) {
    if (x < 0) throw Error('Number must be positive')
    let fractionalPart = x % 1
    fractionalPart = Math.round(fractionalPart * 2 ** 64)
    const integerPart = Math.round(x)

    return new BN(integerPart).shln(64).add(new BN(fractionalPart.toString()))
  },
  convertUQIntToFloat(x) {
    return x.toArray('be', 24).reduce((a, b) => {
      return a * 256 + b * 256 ** -8
    }, 0)
  }
}
