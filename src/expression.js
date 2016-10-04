const syntax = require('./syntax.js');
const lexical = require('./lexical.js');

function evalExp(exp, scope) {
    if (!scope) throw new Error('unable to evalExp: scope undefined');
    var operatorREs = lexical.operators,
        match;
    for (var i = 0; i < operatorREs.length; i++) {
        var operatorRE = operatorREs[i];
        var expRE = new RegExp(`^(${lexical.quoteBalanced.source})(${operatorRE.source})(${lexical.quoteBalanced.source})$`);
        if (match = exp.match(expRE)) {
            var l = evalExp(match[1], scope);
            var op = syntax.operators[match[2].trim()];
            var r = evalExp(match[3], scope);
            return op(l, r);
        }
    }

    if (match = exp.match(lexical.rangeLine)) {
        var low = evalValue(match[1], scope),
            high = evalValue(match[2], scope);
        var range = [];
        for (var j = low; j <= high; j++) {
            range.push(j);
        }
        return range;
    }

    return evalValue(exp, scope);
}

function evalValue(str, scope) {
    str = str && str.trim();
    if (!str) return undefined;

    if (lexical.isLiteral(str)) {
        return lexical.parseLiteral(str);
    }
    if (lexical.isVariable(str)) {
        return scope.get(str);
    }
}

function isTruthy(val) {
    if (val instanceof Array) return !!val.length;
    return !!val;
}

function isFalsy(val) {
    return !isTruthy(val);
}

module.exports = {
    evalExp, evalValue, isTruthy, isFalsy
};
