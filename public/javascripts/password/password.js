'use strict';

let crypto = require('crypto');
let algorithm = 'aes-256-ctr';
let key = 'djcu43R(';

// Encrypt user password
const passwordEncrypt = (value) => {
    let cipher = crypto.createCipher(algorithm, key);
    let crypted = cipher.update(value, 'utf8', 'hex');

    crypted += cipher.final('hex');

    return crypted;
};

// Decrypt user password
const passwordDecrypt = (value) => {
    let decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(value, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
};

module.exports = {
    passwordEncrypt,
    passwordDecrypt
};
