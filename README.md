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
divide it by `2^64`. The reverse goes for converting a decimal number to a
UQ128.64 number, simply multiply your number by `2^64`. UQ128.64 numbers have a
precision of up to `2^-64`

### 2 Functions
#### 2.1 Solidity

Import using: `import 'safe-qmath/contracts/SafeQMath.sol';`

* `function intToQ(uint256 x) internal pure returns (uint192)`

  converts a `uint256` whole number to its corresponding UQ128.64 number
  representation. Will revert if `x` is above the largest possible UQ128.64
  whole number which is `2^128 - 1`

* `function qToIntLossy(uint192 x) internal pure returns (uint256)`

  converts a UQ128.64 number to it's corresponding whole number `uint256`
  representation. This function truncates the decimal portion **without reverting**

* `function qToInt(uint192 x) internal pure returns (uint256)`

  just like `qToIntLossy()` except reverts if any decimal data is present. Only
  use if you're sure your calculations will result in a whole number

* `function qadd(uint192 x, uint192 y) internal pure returns (uint192)`

  adds two UQ128.64 numbers reverting on overflow

* `function qsub(uint192 x, uint192 y) internal pure returns (uint192)`

  subtracts two UQ128.64 numbers reverting on overflow

* `function qmul(uint192 x, uint192 y) internal pure returns (uint192)`

  multiplies two UQ128.64 numbers reverting on overflow. Calculation can result
  in an error of up to `2^-64 - 2^-128`

* `function qdiv(uint192 x, uint192 y) internal pure returns (uint192)`

  multiplies two UQ128.64 numbers reverting on overflow. Calculation can result
  in an error of up to `2^-64 - 2^-128`. Will also revert if `y` is zero

* `function qpow(uint192 base, uint256 exp) internal pure returns (uint192)`

  calculates the `base` to the power of `exp`. The `base` is interpreted as a
  UQ128.64 number but the exponent `exp` as a simple whole number.

  Example:

  ```solidity
  // 1.5^6
  uint192 res = (0x18000000000000000).qpow(6); // => 0xb6400000000000000
  ```

* `function qfloor(uint192 x) internal pure returns (uint192)`

  applies the floor operation to the given UQ128.64 number. Flooring means
  rounding down to the closest whole number. Equivalent to `qToIntLossy()`
  except a UQ128.64 in form of `uint192` is returned

* `function qceil(uint192 x) internal pure returns (uint192)`

  applies the ceil operation to the given UQ128.64 number. Applying the ceil
  operation means rounding up to the closest whole number. Will revert on
  overflow

#### 2.2 Javascript
Import by using:
```javascript
const utils = require('safe-qmath/utils') // or
const { convertFloatToUQInt } = require('safe-qmath/utils') // or

import utils from 'safe-qmath/utils' // or
import { convertFloatToUQInt } from 'safe-qmath/utils'
```

* `convertFloatToUQInt(x: Number) -> BN`

  converts a float into its corresponding UQ128.64 representation stored in a js
  Big Number. Can directly be passed to web3 when calling a contract using the
  `SafeQMath` library

* `convertUQIntToFloat(x: BN) -> Number`

  converts a UQ128.64 number to the corresponding number.

  ```javascript
  utils.convertUQIntToFloat(new BN('18000000000000000', 16)) // => 1.5
  ```

* `round(x: Number, places: Number = 2) -> Number`

  rounds a javascript to Number up to a certain amount of places:

  ```javascript
  utils.round(1.12345) // => 1.12
  utils.round(1.12345, 2) // => 1.12
  utils.round(1.12345, 3) // => 1.123
  ```

  By default the given number will be rounded to `2` decimal places.

* `constants: Object`

  `utils.constants` is as the name suggests a bunch of constants relating to the
  `SafeQMath` library such as `utils.constants.ONE`, the number `1.0` as a
  UQ128.64 number stored as a Big Number. Other constants are also available on
  the `utils.constants` Object that are mainly used in the util functions
  internally.


