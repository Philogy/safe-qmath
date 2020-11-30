// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

// library for UQ128x64 numbers
library SafeQMath {
    uint192 public constant MIN = 0;
    uint192 public constant ONE = (1 << 64);

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
        return uint64(x) > 0 ? qadd(qfloor(x), ONE) : x;
    }

    function qadd(uint192 x, uint192 y) internal pure returns (uint192) {
        uint192 z = x + y;
        require(z >= x, 'SafeQMath: addition overflow');
        return z;
    }

    function qsub(uint192 x, uint192 y) internal pure returns (uint192) {
        require(x >= y, 'SafeQMath: subtraction overflow');
        return x - y;
    }

    function qmul(uint192 x, uint192 y) internal pure returns (uint192) {
        if (x == 0) {
            return 0;
        }

        uint256 res = uint256(x) * uint256(y);
        require(
            res / uint256(x) == uint256(y),
            'SafeQMath: multiplication overflow'
        );
        return uint192(res / ONE);
    }

    function qdiv(uint192 x, uint192 y) internal pure returns (uint192) {
        require(y > 0, 'SafeQMath: Divisor 0');
        uint256 z = (uint256(x) * uint256(ONE)) / uint256(y);
        require(z <= type(uint192).max,  'SafeQMath: divison overflow');
        return uint192(z);
    }
}
