/* global module */

module.exports = {
    getDigit: function (N, n) {
        return Math.floor(N / (Math.pow(10, n)) % 10);
    }
};