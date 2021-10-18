pragma solidity 0.8.0;

import "./BConst.sol";

contract BNum is BConst {
    function badd(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "ERR_ADD_OVERFLOW");
        return c;
    }

    function bsub(uint256 a, uint256 b) internal pure returns (uint256) {
        (uint256 c, bool flag) = bsubSign(a, b);
        require(!flag, "ERR_SUB_UNDERFLOW");
        return c;
    }

    function bsubSign(uint256 a, uint256 b)
        internal
        pure
        returns (uint256, bool)
    {
        if (a >= b) {
            return (a - b, false);
        } else {
            return (b - a, true);
        }
    }

    function bmul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c0 = a * b;
        require(a == 0 || c0 / a == b, "ERR_MUL_OVERFLOW");
        uint256 c1 = c0 + (BONE / 2);
        require(c1 >= c0, "ERR_MUL_OVERFLOW");
        uint256 c2 = c1 / BONE;
        return c2;
    }

    function bdiv(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, "ERR_DIV_ZERO");
        uint256 c0 = a * BONE;
        require(a == 0 || c0 / a == BONE, "ERR_DIV_INTERNAL"); // bmul overflow
        uint256 c1 = c0 + (b / 2);
        require(c1 >= c0, "ERR_DIV_INTERNAL"); //  badd require
        uint256 c2 = c1 / b;
        return c2;
    }

    /**
     * @dev                 Calculate the exponent value
     * @param  baseN        The N of base
     * @param  baseD        The D of base
     * @param  exponential  The exponential
     */
    function bpow(
        uint256 baseN,
        uint256 baseD,
        uint256 exponential
    ) internal pure returns (uint256, uint256) {
        uint256 result = exponential % 2 != 0 ? baseN : baseD;

        for (exponential /= 2; exponential != 0; exponential /= 2) {
            baseN = bmul(baseN, baseN) / baseD;

            if (exponential % 2 != 0) {
                result = bmul(result, baseN) / baseD;
            }
        }
        return (result, baseD);
    }
}
