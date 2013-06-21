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
                        var min = _.min(_.keys(scope.list.data));
                        scope.list.data[min < 0 ? parseInt(min)+1 : -99] 
                            = _.map(scope.list.meta.columns, function(a) { return '';}) ;
                        scope.$digest();
                        LG( scope.$id,  scope.list.data );
                    }
                );
            },
            scope: true,
            controller: function($scope, $element, $attrs) {
                $scope.inAddButton = ' add button scope ' ;
            }
        }
    })
    .directive('loadButton', function factory(dataSrv) {
        return {
            restrict: 'E',
            template: '<input type="button" value="Load" src="data/list.php"></input>',
            link: function(scope, el, attrs) {
                el.find('input').val(attrs.textval)
                                .bind('click', function (data) { 
                                    dataSrv.get(attrs.src, scope, 'list');
                                }
                );
            }
        }
    })
    .directive('grid', function factory(dataSrv, config) {
        return {
            replace:false,
            restrict: 'E',
            scope: { testO: "=", outside : '=' },
            templateUrl: 'html/table.html',
            link: function(scope, el, attrs) {
            },
            controller:  function($scope, $element, $attrs) {
                $scope.ingrid = 'scope in grid';
                dataSrv.get(config[$attrs.config].url, $scope, 'list');

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
