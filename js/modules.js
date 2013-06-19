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
            
            clear: function(key) { typeof key == 'undefined' ? localStorage.clear() : localStorage[key] = ''; },

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

angular.module('app.directives', [])
    .directive('abc', function factory() {
        return {
            replace: true,
            templateUrl: 'html/lorem.html'
        }
        
    })
;
angular.module('app', ['app.services', 'app.directives']);
