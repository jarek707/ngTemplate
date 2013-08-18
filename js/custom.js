angular.module('app.customDirectives', ['app.gridConf'])
    .directive('subText', function factory(config) {
        return {
            restrict    : 'A',
            replace     : true,
            templateUrl : config.tplUrls.subText
        }
    })
    .directive('sub', function factory($compile, gridDataSrv, config) { // head scope
        return {
            restrict    : 'A',
            replace     : true,
            transclude  : true,
            templateUrl : config.tplUrls.sub,
            link : function($scope, $element, $attrs) {
                LG( $scope.meta  , $scope, ' asdf', $attrs);

                $scope.getType = function(i) {
                    return $scope.meta.columns.all[i].type;
                };
            }
        }
    })
;
