// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

// library for UQ128x64 numbers
library SafeQMath {
    uint192 public constant MIN = 0;
    uint192 public constant ONE = (1 << 64);
    uint192 public constant PI  = 0x3243f6a8885a308d3;
    uint192 public constant E   = 0x2b7e151628aed2a6b;
    uint192 public constant LN2 = 0xb17217f7d1cf79ab;

    function intToQ(uint256 x) internal pure returns (uint192) {
        require(x <= type(uint128).max, 'SafeQMath: conversion overflow');
        return uint192(x * ONE);
    }

    function qToIntLossy(uint192 x) internal pure returns (uint256) {
        return uint256(x / ONE);
    }

    function qToInt(uint192 x) internal pure returns (uint256) {
        require(uint64(x) == 0, 'SafeQMath: truncating decimals');
        return uint256(x / ONE);
    }

    function qfloor(uint192 x) internal pure returns (uint192) {
        return x / ONE * ONE;
    }

    function qceil(uint192 x) internal pure returns (uint192) {
        return uint64(x) > 0 ? qadd(qfloor(x), ONE, 'SafeQMath: ceil overflow') : x;
    }

    function qadd(uint192 x, uint192 y) internal pure returns (uint192) {
        return qadd(x, y, 'SafeQMath: addition overflow');
    }

    function qadd(uint192 x, uint192 y, string memory errorMsg)
        internal
        pure
        returns (uint192)
    {
        uint192 z = x + y;
        require(z >= x, errorMsg);
        return z;
    }

    function qsub(uint192 x, uint192 y) internal pure returns (uint192) {
        require(x >= y, 'SafeQMath: subtraction underflow');
        return x - y;
    }

    function qmul(uint192 x, uint192 y) internal pure returns (uint192) {
        return qmul(x, y, 'SafeQMath: multiplic. overflow');
    }

    function qmul(uint192 x, uint192 y, string memory errorMsg) internal pure returns (uint192) {
        if (x == 0) {
            return 0;
        }

        uint256 res = uint256(x) * uint256(y);
        require(res / uint256(x) == uint256(y), errorMsg);
        return uint192(res / ONE);
    }

    function qdiv(uint192 x, uint192 y) internal pure returns (uint192) {
        require(y > 0, 'SafeQMath: Divisor 0');
        uint256 z = (uint256(x) * uint256(ONE)) / uint256(y);
        require(z <= type(uint192).max,  'SafeQMath: division overflow');
        return uint192(z);
    }

    function qpow(uint192 base, uint256 exp) internal pure returns (uint192 res) {
        res = ONE;
        string memory errorMsg =  'SafeQMath: exp. overflow';

        while (exp  > 0) {
            if (exp & 1 == 1) {
                res = qmul(res, base, errorMsg);
            }
            base = qmul(base, base, errorMsg);
            exp /= 2;
        }

        return res;
    }
}
