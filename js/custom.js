angular.module('app.customDirectives', ['app.gridConf'])
    .directive('subText', function factory(config) {
        return {
            restrict    : 'A',
            replace     : true,
            templateUrl : config.tplUrls.subText,
        }
    })
    .directive('sub', function factory($compile, gridDataSrv, config) { // head scope
        return {
            replace : true,
            restrict : 'A',
            templateUrl : config.tplUrls.sub,
            link : function($scope, $element) {
                $scope.meta = [];
                $scope.meta.columns = config.getTabColumns($scope.$attrs.key);

                $scope.getType = function(i) {
                    $scope.meta[i] = config.getInputMeta($scope.$attrs.key, i); 
                    return $scope.meta[i].type;
                };
            }
        }
    })
;
