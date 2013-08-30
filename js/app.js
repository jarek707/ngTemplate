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
LG( localStorage);
// GLOBAL Utility END

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

function topMenu($scope) {
    $scope.lists = { a : 1, b : 2, c :3 }
}

function contentPane($scope, $routeParams, $http, gridDataSrv, config) {
    $scope.clearLocalStorage = function() {
        gridDataSrv.clear();
    }
    //if ( _.isUndefined(localStorage['GRID:METADATA']) ) 
        //localStorage['GRID:METADATA'] = JSON.stringify(config.meta);
}

function leftPane() {}

function rightPane($scope) {
}
