// GLOBAL Utility START
function SER(arg) { return JSON.stringify(arg); }
function LG()     { if (window.console) console.log(arguments);     }
function LGE()    { 
    if (window.console)
        for (var i=0; i < arguments.length; i++ ) {
            console.log(arguments[i]);
        }
}
function LGS()    { if (window.console) console.log(JSON.stringify(arguments));     }
function LGT()    { 
    var args  = _.map(arguments, function(v,k) {return v});
    setTimeout(function() {if (window.console) console.log(args);}, args.pop()); 
}

UT = {
    minIntKey : function(obj, offset) {
        if (_.isUndefined(offset)) offset = 0;

        if ( _.isEmpty(obj) ) {
            return parseInt(offset);
        } else {
            var minKey = _.min(_(_.keys(obj)).map(function(a) {return parseInt(a)}));
            return (minKey > 0 ? 0 : minKey) + parseInt(offset);
        }
    },

    mkEmpty : function(arr, data) {
        return _.map(arr, function(a) {return (_.isUndefined(data) ? '' : data)});
    },

    camelize : function(str, upFirst) {
        var firstChar = str.charAt(0);

        var $return = UT.join( _(str.split('_')).map( 
            function(a,b) { return  a.charAt(0).toUpperCase() + a.substring(1).toLowerCase() }
        ),'');

        return upFirst ? $return : firstChar + $return.substr(1);
    },

    doubleCopy : function(src, dest) {
        if (_(dest).isObject()) angular.copy(src, dest);

        return angular.copy(src);
    },

    gridKey : function( inKey ) {
        return inKey.replace(/-*\d+\//g, '');
    },

    // IE8 workaround for array.join()
    join : function(inArr, delim) {
        if (typeof delim == 'undefined') 
            delim = ', ';
            
        var csv = '';
        for (var i = 0; i<inArr.length; i++)
            if (typeof inArr[i] != 'undefined' && !_.isEmpty(inArr[i]) && inArr[i] != null) 
                csv += delim  + inArr[i];

       return csv.substr(delim.length);
    }
}
//
// Sugar START
//
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

Function.method('inherits', function (parent) {
    this.prototype = new parent();
    var d = {}, 
        p = this.prototype;
    this.prototype.constructor = parent; 
    this.method('uber', function uber(name) {
        if (!(name in d)) {
            d[name] = 0;
        }        
        var f, r, t = d[name], v = parent.prototype;
        if (t) {
            while (t) {
                v = v.constructor.prototype;
                t -= 1;
            }
            f = v[name];
        } else {
            f = p[name];
            if (f == this[name]) {
                f = v[name];
            }
        }
        d[name] += 1;
        r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
        d[name] -= 1;
        return r;
    });
    return this;
});

Function.method('swiss', function (parent) {
    for (var i = 1; i < arguments.length; i += 1) {
        var name = arguments[i];
        this.prototype[name] = parent.prototype[name];
    }
    return this;
});
//
// Sugar END
//
/*
function base (arg) {

    this.a = arg;
}

base.method('set', function(a) { this.a = a;    });
base.method('get', function()  { return this.a; });

var t = new base('t');
var r = new base('r');

function derived(value) {
    //this.a = value;
    this.uber('set',value + ' inherited');
    this.b = value + ' derived';
}
derived.inherits(base);

derived.method('set', function(a) { this.uber('set',a); });
derived.method('get', function()  { 
    return "From derived: " + this.b + ' and From Uber: ' + this.uber('get'); 
});

derived.method('getLoc', function() { return this.a; });

b = new base('bbb');
d = new derived('ddd');

*/
