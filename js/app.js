function topMenu($scope) {
    $scope.lists = { a : 1, b : 2, c :3 }
}

function contentPane($scope, $routeParams, $http, dataSrv) {
    //$scope.list = {a:1};
    $scope.list = {"a":123};
    $scope.testO = {"a":123};
    $scope.str1 = 'str 1';
    $scope.outside = 'outside scope is seen';
    LG( $scope.$id, ' in content pane' , $scope);
        
    //LGT( $scope.$id, ' outside ', $scope.ingrid, 300 );


}

function leftPane() {}

function rightPane($scope) {
}
