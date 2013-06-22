function LG() {
    console.log(arguments);
}

function LGT() {
    var args  = _.map(arguments, function(v,k) {return v});
    setTimeout( function() {LG( args );}, args.pop() );
}

//
// Modules
//
angular.module('app.services', [])
    .factory('config', function() {
        return {
            'renters'  : {
                'headers' : ['First', 'Last' , 'Start Date', 'End Date', 'Monthly Rent'],
                'url'     : 'data/renters.php',
                'storage' : 'renters'
            },
            'managers' : {
                'headers' : ['First', 'Last' , 'Email', 'Phone'],
                'url'     : 'data/managers.php',
                'storage' : 'managers'
            }
        }
    })
    .factory('dataSrv', function($http) {
        return  {
            test: function() {
                LG('test', angular.element );
            },
            
            clear: function(key) { 
                typeof key == 'undefined' ? localStorage.clear() : delete localStorage[key]; 
            },

            get: function(key, scope, dataObj) {
                $http.get(key).success( function(data) { scope[dataObj] = data; } )
                              .error(   function(data) { scope[dataObj] = JSON.parse(localStorage[key]) } );
            },

            set: function(key, data) {
                $http.post(key, data).error( function() { 
                    localStorage[key] = JSON.stringify(data);
                });
            }
        }
    })
;

//
//  Directives
//
angular.module('app.directives', [])
    .directive('addButton', function factory(dataSrv) {
        return {
            restrict: 'E',
            template: '<input type="button" value="X"></input>',
            link: function(scope, el, attrs) {
                el.find('input').bind('click', 
                    function (data) { 
                        var pList = scope.$parent.list;
                        var min = _.min(_.keys(pList.data));
                        pList.data[min < 0 ? parseInt(min)+1 : -99] = _.map(scope.$parent.list.meta.columns, function(a) { return '';}) ;
                        scope.$parent.$digest();
                    }
                );
            },
            scope: {},
            controller: function($scope, $element, $attrs) {
                $scope.inAddButton = ' add button scope ' ;
                LGT( $scope , ' bt ctrl');
            }
        }
    })
    .directive('row', function factory(dataSrv, config) {
        return {
            replace:false,
            restrict: 'E',
            templateUrl: 'html/row.html',
        }

    })
    .directive('grid', function factory(dataSrv, config) {
        return {
            replace:false,
            restrict: 'E',
            scope: { testO: "=", outside : '='},
            templateUrl: 'html/table.html',
            link: function(scope, el, attrs) {
            },
            controller:  function($scope, $element, $attrs) {
                $scope.ingrid = 'scope in grid';

                dataSrv.get(config[$attrs.config].url, $scope, 'list');

                $scope.showSaveButton = function() {
                    LG( 'show button ');
                    $scope.inputShow = true;
                }

                $scope.sav = function(id) {
                    LG( id );
                },

                $scope.del = function(id) { delete $scope.list.data[id]; }
                $scope.chg = function(elm) { LG( elm ); }
            }
        }
    })
    .directive('box', function factory() {
        return {
            restrict:   'E',
            template:   '<div class="box"></div>',
            transclude: true,
            replace:    true
        }
        
    })
;

angular.module('app', ['app.services', 'app.directives']);
