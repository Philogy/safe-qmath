const { expectRevert, BN } = require('@openzeppelin/test-helpers')
const {
  convertUQIntToFloat,
  convertFloatToUQInt,
  constants: { MAX_UQINT, ONE, MAX_CONVERTIBLE_UINT256 }
} = require('../utils')

const SafeQMathMock = artifacts.require('SafeQMathMock')

const { expect } = require('chai')

contract('SafeQMathMock', () => {
  beforeEach(async () => {
    this.safeQMath = await SafeQMathMock.deployed()
  })

  describe('contract conversions', () => {
    it('converts uint256 to uint192 UQInt correctly', async () => {
      const x = new BN('123')
      const convertedX = await this.safeQMath.intToQ(x)

      expect(convertedX).to.be.bignumber.equal(x.mul(ONE))
    })

    it('reverts when uint to convert cannot fit into UQInt', async () => {
      const x = MAX_CONVERTIBLE_UINT256.add(new BN('1'))

      await expectRevert(this.safeQMath.intToQ(x), 'SafeQMath: conversion overflow')
    })

    it('lossy converts UQInt to uint with correctly', async () => {
      const x = convertFloatToUQInt(12.3456)
      const convertedX = await this.safeQMath.qToIntLossy(x)

      expect(convertedX).to.be.bignumber.equal(new BN('12'))

      const y = convertFloatToUQInt(12)
      const convertedY = await this.safeQMath.qToIntLossy(y)

      expect(convertedY).to.be.bignumber.equal(new BN('12'))
    })

    it('converts UQInt to uint without loss correctly', async () => {
      const x = convertFloatToUQInt(12)
      const convertedX = await this.safeQMath.qToInt(x)

      expect(convertedX).to.be.bignumber.equal(new BN('12'))
    })

    it('reverts when UQInt has decimal places while losslessly converting', async () => {
      const x = convertFloatToUQInt(12.3456)

      await expectRevert(this.safeQMath.qToInt(x), 'SafeQMath: truncating decimals')
    })
  })

  const testUQ = async (fn, x, y, expectedRes) => {
    const a = convertFloatToUQInt(x)
    const b = convertFloatToUQInt(y)

    const res = await fn(a, b)

    expect(convertUQIntToFloat(res)).to.be.equal(expectedRes)
  }

  const testFailUQ = async (fn, x, y, reason) => {
    await expectRevert(fn(convertFloatToUQInt(x), convertFloatToUQInt(y)), reason)
  }

  describe('division', () => {
    it('divides correctly', async () => {
      const x = 123.456
      const y = 0.789

      await testUQ(this.safeQMath.qdiv, x, y, x / y)
    })

    it('divides zero correctly', async () => {
      const x = 0
      const y = 56.78

      await testUQ(this.safeQMath.qdiv, x, y, x / y)
    })

    it('reverts on division by zero', async () => {
      const x = 123.456
      const y = 0

      await testFailUQ(this.safeQMath.qdiv, x, y, 'SafeQMath: Divisor 0')
    })

    it('reverts on division overflow', async () => {
      const x = MAX_UQINT
      const y = new BN('1') // 2^-64

      await expectRevert(this.safeQMath.qdiv(x, y), 'SafeQMath: division overflow')
    })
  })

  const testCommutativeUQ = async (fn, x, y, expectedRes) => {
    await testUQ(fn, x, y, expectedRes)
    await testUQ(fn, y, x, expectedRes)
  }

  const testFailCommutativeUQ = async (fn, x, y, reason) => {
    await testFailUQ(fn, x, y, reason)
    await testFailUQ(fn, y, x, reason)
  }

  describe('multiplication', () => {
    it('multiplies correctly', async () => {
      const x = 3.456
      const y = 0.1278

      await testCommutativeUQ(this.safeQMath.qmul, x, y, x * y)
    })

    it('multiplies by zero correctly', async () => {
      const x = 0
      const y = 0.1278

      await testCommutativeUQ(this.safeQMath.qmul, x, y, x * y)
    })

    it('reverts on multiplication overflow', async () => {
      const x = MAX_UQINT
      const y = convertFloatToUQInt(1.00001)
      const revertReason = 'SafeQMath: multiplic. overflow'

      await expectRevert(this.safeQMath.qmul(x, y), revertReason)
      await expectRevert(this.safeQMath.qmul(y, x), revertReason)
    })
  })
})
