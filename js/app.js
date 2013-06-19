function topMenu($scope) {
    $scope.lists = { a : 1, b : 2, c :3 }
}

function contentPane($scope, $routeParams, $http, dataSrv) {
    $scope.jsn = {a: 'empty'};
    $scope.fetch = function(arg) {
        var url = 'data/list.php';
        //dataSrv.get(url, $scope, 'jsn');
        //dataSrv.set(url, $scope.jsn);
        dataSrv.test();
    }
}

function leftPane() {}

function rightPane($scope) {
    $scope.z = [123, 323, 4432];
}
