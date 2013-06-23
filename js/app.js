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
