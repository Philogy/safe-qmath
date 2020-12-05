const { expectRevert, BN } = require('@openzeppelin/test-helpers')
const {
  convertUQIntToFloat,
  convertFloatToUQInt,
  constants: { MAX_UQINT, ONE, MAX_CONVERTIBLE_UINT256, ALLOWED_ERROR }
} = require('../utils')

const SafeQMathMock = artifacts.require('SafeQMathMock')

const { expect } = require('chai')

contract('SafeQMathMock', () => {
  beforeEach(async () => {
    this.safeQMath = await SafeQMathMock.deployed()
  })

  describe('contract conversions', () => {
    it('converts uint256 to UQInt correctly', async () => {
      const x = new BN('123')
      const convertedX = await this.safeQMath.intToQ(x)

      expect(convertedX).to.be.bignumber.equal(x.mul(ONE))
    })

    it('reverts when uint256 to convert cannot fit into UQInt', async () => {
      const x = MAX_CONVERTIBLE_UINT256.add(new BN('1'))

      await expectRevert(this.safeQMath.intToQ(x), 'SafeQMath: conversion overflow')
    })

    it('lossy converts UQInt to uint256 with correctly', async () => {
      const x = convertFloatToUQInt(12.3456)
      const convertedX = await this.safeQMath.qToIntLossy(x)

      expect(convertedX).to.be.bignumber.equal(new BN('12'))

      const y = convertFloatToUQInt(12)
      const convertedY = await this.safeQMath.qToIntLossy(y)

      expect(convertedY).to.be.bignumber.equal(new BN('12'))
    })

    it('converts UQInt to uint256 without loss correctly', async () => {
      const x = convertFloatToUQInt(12)
      const convertedX = await this.safeQMath.qToInt(x)

      expect(convertedX).to.be.bignumber.equal(new BN('12'))
    })

    it('reverts when UQInt has decimal places while losslessly converting', async () => {
      const x = convertFloatToUQInt(12.3456)

      await expectRevert(this.safeQMath.qToInt(x), 'SafeQMath: truncating decimals')
    })
  })

  describe('floor', () => {
    it('applies floor correctly', async () => {
      const x = convertFloatToUQInt(123.99997)
      const flooredX = await this.safeQMath.qfloor(x)

      expect(flooredX).to.be.bignumber.equal(convertFloatToUQInt(123))
    })

    it('floors already floored number correctly', async () => {
      const x = convertFloatToUQInt(123)
      const flooredX = await this.safeQMath.qfloor(x)

      expect(flooredX).to.be.bignumber.equal(x)
    })
  })

  describe('ceil', () => {
    it('applies ceil correctly', async () => {
      const x = convertFloatToUQInt(123.99997)
      const ceiledX = await this.safeQMath.qceil(x)

      expect(ceiledX).to.be.bignumber.equal(convertFloatToUQInt(124))
    })

    it('reverts on ceil overflow', async () => {
      await expectRevert(this.safeQMath.qceil(MAX_UQINT), 'SafeQMath: ceil overflow')
    })

    it('ceils already ceiled number correctly', async () => {
      const x = convertFloatToUQInt(123)
      const ceiledX = await this.safeQMath.qceil(x)

      expect(ceiledX).to.be.bignumber.equal(x)
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

  const testCommutativeFail = async (fn, x, y, reason) => {
    await expectRevert(fn(x, y), reason)
    await expectRevert(fn(y, x), reason)
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

      await testCommutativeFail(this.safeQMath.qmul, x, y, 'SafeQMath: multiplic. overflow')
    })
  })

  describe('addition', () => {
    it('adds correctly', async () => {
      const x = 123.45
      const y = 6789.1011

      await testCommutativeUQ(this.safeQMath.qadd, x, y, x + y)
    })

    it('reverts on addition overflow', async () => {
      const x = MAX_UQINT
      const y = new BN('1')

      await testCommutativeFail(this.safeQMath.qadd, x, y, 'SafeQMath: addition overflow')
    })
  })

  describe('subtraction', () => {
    it('subtracts correctly', async () => {
      const x = 6789.1011
      const y = 123.45

      await testUQ(this.safeQMath.qsub, x, y, x - y)
    })

    it('reverts on subtraction underflow', async () => {
      const x = new BN('0')
      const y = new BN('1')

      await testFailUQ(this.safeQMath.qsub, x, y, 'SafeQMath: subtraction underflow')
    })
  })

  describe('exponentiation', () => {
    it('exponentiates correctly within certain error', async () => {
      const base = 1.0000000234
      const exp = 56789100

      const res = await this.safeQMath.qpow(convertFloatToUQInt(base), new BN(exp))
      const expectedRes = convertFloatToUQInt(Math.pow(base, exp))

      const errorPrec = new BN('10').pow(ALLOWED_ERROR.decimals)
      const error = errorPrec.sub(res.mul(errorPrec).div(expectedRes)).abs()

      expect(error).to.be.bignumber.at.most(ALLOWED_ERROR.err)
    })

    it('reverts on exponentiaion overflow', async () => {
      const base = new BN('1').shln(47).mul(ONE)
      const exp = new BN('3')

      await expectRevert(this.safeQMath.qpow(base, exp), 'SafeQMath: exp. overflow')
    })
  })
})
