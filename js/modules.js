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
            restrict: 'EA',
            template: '<input type="button" value="Add"></input>',
            link: function(scope, el, attrs) {
                el.find('input').bind('click', 
                    function (data) { 
                        LG( scope.list );
                    }
                );
            }
        }
    })
    .directive('loadButton', function factory(dataSrv) {
        return {
            restrict: 'EA',
            template: '<input type="button" value="Load" src="data/list.php"></input>',
            link: function(scope, el, attrs) {
                el.find('input').val(attrs.textval)
                                .bind('click', function (data) { 
                                    dataSrv.get(attrs.src, scope, 'list');
                                    LG( scope );
                                }
                );
            }
        }
    })
    .directive('box', function factory() {
        return {
            restrict:   'EA',
            template:   '<div class="box"></div>',
            transclude: true,
            replace:    true
        }
        
    })
    .directive('grid', function factory(dataSrv) {
        return {
            replace:false,
            restrict: 'CEA',
            templateUrl: 'html/table.html',
            //template: "<div>inside</div>",
            link: function(scope, el, attrs) {
            },
            controller:  function($scope, $element, $attrs) {
                $scope.del = function(id) {
                    delete $scope.list.data[id];
                }
            }
        }
    })
;

angular.module('app', ['app.services', 'app.directives']);
