function topMenu($scope) {
    $scope.lists = { a : 1, b : 2, c :3 }
}

function contentPane($scope, $routeParams, $http, dataSrv) {
    //$scope.list = {a:1};
    $scope.list = {};
    var _scope = $scope;

    $scope.del = function(k,v) {
        LG( 'del in ctl, ', k, v);
    }

}

function leftPane() {}

function rightPane($scope) {
}
