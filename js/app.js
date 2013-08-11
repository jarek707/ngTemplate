// GLOBAL Utility START
function SER(arg) { return JSON.stringify(arg); }
function LG()     { console.log(arguments);     }
function LGT()    { var args  = _.map(arguments, function(v,k) {return v});
                    setTimeout(function() {console.log(args);}, args.pop()); }
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

    mkEmpty : function(arr, id) {
        return _.map(arr, function(a) {return (_.isUndefined(id) ? '' : id)});
    },

    camelize : function(str, upFirst) {
        var firstChar = str.charAt(0);

        var $return = ( _(str.split('_')).map( 
            function(a,b) { return  a.charAt(0).toUpperCase() + a.substring(1).toLowerCase() }
        )).join('');

        return upFirst ? $return : firstChar + $return.substr(1);
    },

    doubleCopy : function(src, dest) {
        if (_(dest).isObject()) angular.copy(src, dest);

        return angular.copy(src);
    },

    gridKey : function( inKey ) {
        return inKey.replace(/-*\d+\//g, '');
    }
}

function topMenu($scope) {
    $scope.lists = { a : 1, b : 2, c :3 }
}

function contentPane($scope, $routeParams, $http, gridDataSrv, config) {
    $scope.clearLocalStorage = function() {
        if (confirm ('This will clear your entire local storage.\nPlease confirm.\n\nAftwrwards you need to reload the page to see changes.'))
            gridDataSrv.clear();
    }
    if ( _.isUndefined(localStorage['GRID:METADATA']) ) 
        localStorage['GRID:METADATA'] = JSON.stringify(config.meta);

    LG( localStorage );
}

function leftPane() {}

function rightPane($scope) {
}


