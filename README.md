# Library for UQInt128.64 math operations
This Library enables simple arithmetic operations for fractional numbers.
Fractional numbers are stored in a UQ128.64 format. This means that each
fractional number should be stored in a `uint192`. This is done on the one hand
to avoid mixing up fractional numbers with whole numbers and to make certain
calculations more efficient.

## Installation
`npm i safe-qmath`

## Usage

contract:
```solidity
import 'safe-qmath/contracts/SafeQMath.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract FracMath {
  using SafeQMath for uint192;
  using SafeMath for uint256;

  function calculateFee(uint256 principalAmount, uint192 fee)
    public
    pure
    returns (uint256 remainder, uint256 takenFee)
  {
    takenFee = SafeQMath.intToQ(principalAmount).qmul(fee).qToIntLossy();
    remainder = principalAmount.sub(takenFee);
  }
}

```

javascript:
```javascript
const { convertFloatToUQInt } = require('safe-qmath/utils')

const uqintFee = convertFloatToUQInt(0.2) // returns BN storing the UQ128.64 number
```

## Documentation

### 1 Number format (UQ128.64)

When the SafeQMath library performs arithmetics on `uin192` it expects UQ128.64
numbers. UQ128.64 numbers are unsigned fixed points numbers with a total length
of `192 bits` with the last `64 bits` representing the fractional part:

```UQ128.64: <whole number: 128 bits> | <fraction: 64>```

Mathematically to convert the raw `uin192` to its "real" representation simply
divide it by $2^{64}$. The reverse goes for converting a decimal number to a
UQ128.64 number, simply multiply your float by $2^{64}$

### 2 Functions
#### 2.1 Solidity

* `function intToQ(uint256 x) internal pure returns (uint192)`

  converts a `uint256` whole number to its corresponding UQ128.64 number
  representation. Will revert if `x` is above the largest possible UQ128.64
  whole number which is $2^{128}-1$
