function SER( arg ) {
   return JSON.stringify( arg ); 
}

function LG() {
    console.log(arguments);
}

function LGT() {
    var args  = _.map(arguments, function(v,k) {return v});
    setTimeout( function() {console.log( args );}, args.pop() );
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
            },
            'loc' : {
                'headers' : ['First', 'Last' , 'Local'],
                'url'     : 'data/loc.php',
                'storage' : 'loc'
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
                $http.get(key).success( function(data) { 
                                            scope.list  = data; 
                                            scope.listP = angular.copy(data);
                                            
                              })
                              .error(   function(data) { 
                                LG( localStorage[key], ' ls key', key, dataObj );
                                scope[dataObj] = _.isEmpty(localStorage[key]) ? {} : JSON.parse(localStorage[key]) } 
                              );
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
                        var list = scope.$parent.list;
                        var min = _.min(_.keys(list.data));
                        var newIdx =  min < 0 ? parseInt(min)+1 : -99;
                        list.data[newIdx] = _.map(list.meta.columns, function(a) { return '';}) ;
                        scope.$parent.listP.data[newIdx] = _.map(list.meta.columns, function(a) { return '';}) ;
                        scope.$parent.$digest();
                    }
                );
            },
            scope: {},
            controller: function($scope, $element, $attrs) {
            }
        }
    })
    .directive('tdInput', function factory() {
        return {
            replace:true,
            restrict: 'E',
            scope: true,
            template: '<input type="text" ng-model="field" ng-change="chg(id, i)" ng-click="clk(id)" />',
            link: function(sc, el) {
                el.bind('blur', sc.blr);
            },
            controller: function($scope, $element, $attrs) {
                var rowScope = $scope.$parent.$parent;

                $scope.blr = function() {
                    rowScope.trClass = isDirty(rowScope.id) ? 'dirty' : '';

                };

                $scope.clk = function(id) {
                    rowScope.rowId = id;
                    rowScope.trClass = 'selected';   
                };

                $scope.chg = function(id, i) {
                    $scope.listP.data[id][i] = $scope.field;
                    LG( rowScope, ' rs'  );
                    rowScope.dirty = isDirty(id);
                    rowScope.trClass = rowScope.dirty ? 'dirty selected' : 'selected';
                };

                function isDirty(id) { 
                    return !_.isEmpty(
                        _.filter($scope.list.data[id], function(v,k) { return v !== $scope.listP.data[id][k]; })
                    );
                };
            }
        }
    })
    .directive('grid', function factory(dataSrv, config) {
        return {
            replace:false,
            restrict: 'E',
            scope: {},
            templateUrl: 'html/table.html',
            link: function(scope, el, attrs) {},
            controller:  function($scope, $element, $attrs) {
                dataSrv.get(config[$attrs.config].url, $scope, 'list');

                $scope.sav = function(id, scope) {
                    _.each($scope.listP.data[id], function(v,k) { $scope.list.data[id][k] = v; });
                    scope.dirty = false;
                    scope.trClass = '';
                };

                $scope.del = function(id) { delete $scope.list.data[id]; }
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
