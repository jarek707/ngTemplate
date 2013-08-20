angular.module('app.customDirectives', ['app.gridConf'])
    .directive('detail', function factory($compile, gridDataSrv, config) { // head scope
        return {
            restrict    : 'A',
            replace     : true,
            transclude  : true,
            templateUrl : config.tplUrls.sub,
            scope       : true,
            compile     : function(el, attrs) {
                return function($scope, $element, $attrs) {
                    $scope.detailShow = true;
                    $scope.getType = function(i) {
                        return $scope.meta.all[i].type;
                    };
                }
            },
            controller: function($scope, $element) {
                $scope.metaType = 'all';

                $scope.sav = function() { 
                    $scope.close();
                    $scope.$parent.sav();
                };

                $scope.close = function() {
                    $element.remove();
                    $scope.$parent.$parent.tableHide = false;
                }
            }
        }
    })
;
