_.mixin({
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

    camelize : function(str) {
        return ( _(str.split('_')).map( 
            function(a,b) { return  a.charAt(0).toUpperCase() + a.substring(1).toLowerCase() }
        )).join('');
    },

    deepCopy : function(src, dest) {
        if (_(dest).isObject()) angular.copy(src,dest);

        return angular.copy(src);
    },

    gridKey : function( inKey ) {
        return inKey.replace(/-*\d+\//g, '');
    },

    $ : function(domEl) {
        return angular.element(domEl);
    },

    $attr : function(domEl, key, val) {
        if ( _.isUndefined(val) )
            return angular.element(domEl).attr(key);
        else 
            angular.element(domEl).attr(key, val);
    }
});

function topMenu($scope) {
    $scope.lists = { a : 1, b : 2, c :3 }
}

function contentPane($scope, $routeParams, $http, gridDataSrv) {
    $scope.clearLocalStorage = function() {
        if (confirm ('This will clear your entire local storage.\nPlease confirm.\n\nAftwrwards you need to reload the page to see changes.'))
            gridDataSrv.clear();
    }
}

function leftPane() {}

function rightPane($scope) {
}

LG( localStorage );
