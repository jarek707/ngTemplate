// GLOBAL Utility START
function SER( arg ) { return JSON.stringify( arg ); }

function LG() {
    console.log(arguments);
}

function LGT() {
    var args  = _.map(arguments, function(v,k) {return v});
    setTimeout( function() {console.log( args );}, args.pop() );
}
// GLOBAL Utility END

//
// Service Modules START
//
angular.module('app.gridConf', [])
    .factory('config', function() {
        return {
            'meta' : {
                'renters'  : {
                    'columns' : ['First', 'Last' , 'Start Date', 'End Date', 'Monthly Rent'],
                    'url'     : 'data/renters.php',
                    'storage' : 'renters'
                },
                'managers' : {
                    'columns' : ['First', 'Last' , 'Email', 'Phone'],
                    'url'     : 'data/managers.php',
                    'storage' : 'managers'
                },
                'loc' : {
                    'columns' : ['First', 'Last' , 'Local'],
                    'url'     : 'data/loc.php',
                    'storage' : 'loc'
                }
            },

            getMeta : function(key, field) {
                return  _.isEmpty(this.meta[key]) 
                        ?   false
                        :   (!_.isEmpty(field) && !_.isEmpty(this.meta[key][field]) 
                                ? this.meta[key][field] 
                                : this.meta[key]
                            );
            }

        }
    })
;
angular.module('app.services', ['app.gridConf'])
    .factory('gridDataSrv', function($http,config) {
        return  {

            clear: function(key) { 
                typeof key == 'undefined' ? localStorage.clear() : delete localStorage[key]; 
            },

            get: function(key, scope, dataObj) {
                var url = config.getMeta(key, 'url');
                if ( url )
                    $http.get(url).success( function(data) { 
                                    scope.list       = { data : data }; 
                                    scope.list.meta  = config.getMeta(key);
                                    scope.listW      = { data : angular.copy(data) };
                                    scope.listW.meta = config.getMeta(key);
                                })
                                .error(   function(data) { 
                                    LG( ' not found ' );
                                    scope[dataObj] = _.isEmpty(localStorage[key]) ? {} : JSON.parse(localStorage[key]) } 
                                );
                 else {
                    LG ( "Local Storage" , localStorage );
                    if ( _.isEmpty(localStorage[key]) ) {
                        var cols = prompt(
                            'Field ' + key + ' is not defined.\nPlease enter column names separated by commas:'
                        ).split(',');

                        scope.list = { meta : {columns : cols}, data : { "-99": this.mkEmpty(cols)} };
                        scope.listW = angular.copy( scope.list );
                        
                        localStorage[key] = JSON.stringify(scope.list);
                    } else {
                        scope.list  = JSON.parse(localStorage[key]);
                        scope.listW = JSON.parse(localStorage[key]);
                    }
                 }
            },

            mkEmpty : function( columns ) { 
                return _.map(columns, function(a) { return '';}) 
            },

            sav: function(key, list) {
                localStorage[key] = JSON.stringify( list );
            }
        }
    })
;
// Service Modules END

//
//  Directives START
//
angular.module('app.directives', [])
    .directive('tdInput', function factory() {
        return {
            replace  : true,
            restrict : 'E',
            scope    : true,
            template : '<input type="text" ng-model="field" ng-change="chg(id, i)" ng-click="clk(id)" />',

            link: function(scope, el) {
                el.bind('blur', scope.blr);
            },

            controller: function($scope, $element, $attrs) {
                var rowScope = $scope.$parent.$parent;

                $scope.blr = function() {
                    rowScope.trClass = isDirty(rowScope.id) ? 'dirty' : '';
                };

                $scope.clk = function(id) {
                    rowScope.rowId = id;
                    rowScope.trClass = 'selected' + (isDirty(id) ? ' dirty' : '');   
                };

                $scope.chg = function(id, i) {
                    $scope.listW.data[id][i] = $scope.field;
                    rowScope.dirty = isDirty(id);
                    $scope.clk(id);
                };

                function isDirty(id) { 
                    return !_.isEmpty(
                        _.filter($scope.list.data[id], function(v,k) { return v !== $scope.listW.data[id][k]; })
                    );
                };
            }
        }
    })
    .directive('grid', function factory(gridDataSrv, config) {
        return {
            replace     : false,
            restrict    : 'E',
            scope       : {},
            templateUrl : 'html/table.html',

            controller:  function($scope, $element, $attrs) {
                gridDataSrv.get($attrs.config, $scope, 'list');

                $scope.sav = function(id, scope) {
                    _.each($scope.listW.data[id], function(v,k) { $scope.list.data[id][k] = v; });
                    scope.dirty = false;
                    scope.trClass = '';
                    gridDataSrv.sav($attrs.config, $scope.list);
                };

                $scope.del = function(id)  { 
                    delete $scope.list.data[id];
                    gridDataSrv.sav($attrs.config, $scope.list);
                };

                $scope.reload = function() { 
                    $scope.listW = angular.copy($scope.list); 
                    $scope.list  = angular.copy($scope.list); // Need to refresh list to re-render from original data
                                                              // TODO: there's gotta be a better way
                };

                $scope.add = function() {
                    var min    = _.min(_.keys($scope.list.data));
                    var newIdx =  min < 0 ? parseInt(min)+1 : -99;
                    
                    $scope.list.data[newIdx]  = gridDataSrv.mkEmpty($scope.list.meta.columns);
                    $scope.listW.data[newIdx] = gridDataSrv.mkEmpty($scope.list.meta.columns);
                }
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
//  Directives END

angular.module('app', ['app.services', 'app.directives']);
