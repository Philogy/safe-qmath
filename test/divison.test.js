const { expectRevert, BN } = require('@openzeppelin/test-helpers')
const { convertUQIntToFloat, convertFloatToUQInt, round } = require('../src/utils')

const SafeQMathMock = artifacts.require('SafeQMathMock')

const { assert } = require('chai')

const doDivide = (qMath, precision = 7) => async (x, y) => {
  const qx = convertFloatToUQInt(x)
  const qy = convertFloatToUQInt(y)

  const qz = await qMath.qdiv(qx, qy)
  const z = convertUQIntToFloat(qz)

  assert.equal(round(z, precision), round(x / y, precision))
}

contract('SafeQMathMock', () => {
  it('normal range division', async () => {
    const qMath = await SafeQMathMock.deployed()
    const checkDivide = doDivide(qMath)

    await checkDivide(3, 2)
    await checkDivide(32, 0.23106)
    await checkDivide(3.16, 27890.3)
  })
})
