// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import '../SafeQMath.sol';

// Mock of the SafeQMath lib to be able to test it
contract SafeQMathMock {
    using SafeQMath for uint256;
    using SafeQMath for uint192;

    uint192 public MIN = SafeQMath.MIN;
    uint192 public ONE = SafeQMath.ONE;

    function intToQ(uint256 x) external pure returns (uint192) {
        return x.intToQ();
    }

    function qToIntLossy(uint192 x) external pure returns (uint256) {
        return x.qToIntLossy();
    }

    function qToInt(uint192 x) external pure returns (uint256) {
        return x.qToInt();
    }

    function qfloor(uint192 x) external pure returns (uint192) {
        return x.qfloor();
    }

    function qceil(uint192 x) external pure returns (uint192) {
        return x.qceil();
    }

    function qadd(uint192 x, uint192 y) external pure returns (uint192) {
        return x.qadd(y);
    }

    function qsub(uint192 x, uint192 y) external pure returns (uint192) {
        return x.qsub(y);
    }

    function qmul(uint192 x, uint192 y) external pure returns (uint192) {
        return x.qmul(y);
    }

    function qdiv(uint192 x, uint192 y) external pure returns (uint192) {
        return x.qdiv(y);
    }

    function qpow(uint192 b, uint256 e) external pure returns (uint192) {
        return b.qpow(e);
    }
}
