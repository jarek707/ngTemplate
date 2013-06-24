// GLOBAL Utility START
function SER(arg) { return JSON.stringify(arg); }
function LG()     { console.log(arguments);     }
function LGT()    { var args  = _.map(arguments, function(v,k) {return v});
                    setTimeout(function() {console.log(args);}, args.pop()); }
LG ("Local Storage", localStorage);

_.mixin({
    minIntKey : function(obj) {
        if ( _.isEmpty(obj) ) {
            return 0;
        } else {
            var minKey = _.min(_(_.keys(obj)).map(function(a) {return parseInt(a)}));
            return minKey > 0 ? 0 : minKey;
        }
    }
});

// GLOBAL Utility END

//
// Service Modules START
//
angular.module('app.gridConf', [])
    .factory('config', function() {
        return {
            'meta' : {
                'renters'  : {
                    'url'     : 'data/renters.php',
                    'columns' : ['First', 'Last' , 'Start Date', 'End Date', 'Monthly Rent']
                },
                'managers' : {
                    'columns' : ['First', 'Last' , 'Email', 'Phone'],
                    'url'     : 'data/managers.php'
                },
                'localstuff' : {
                    'columns' : ['First', 'Last' , 'Local']
                }
            },

            getMeta : function(key, field) {
                if (_.isUndefined(this.meta[key])) {
                    return false; 
                } else {
                    if (_.isUndefined(field)) {
                        return this.meta[key];
                    } else {
                        if (_.isUndefined(this.meta[key][field])) {
                            return null;
                        } else {
                            return this.meta[key][field];
                        }
                    }
                }
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

            setParams : function(attrs) {
                var $return = {key:attrs.key, columns:[], url:null};

                if ( _.isUndefined(attrs.columns)) {
                    $return.columns = config.getMeta(attrs.key, 'columns');

                    if ($return.columns === null) {
                        $return.columns = 
                            prompt('Field ' + key + ' is not defined.\nPlease enter column names separated by commas:').split(',');
                    }
                } else {
                    $return.columns = attrs.columns.split(',');
                }

                $return.url = _.isUndefined(attrs.url) ? config.getMeta(attrs.key, 'url') : attrs.url;

                return _.isEmpty($return.columns) ? false : $return;
            },

            get: function(attrs, scope) {
                function setLists(src){
                    scope.listW = angular.copy( scope.list = src );
                };

                var params = this.setParams(attrs);

                if ( params.url )
                    $http.get(params.url).success( function(data) { 
                        setLists({data:data, meta:config.getMeta(params.key)});
                    });
                 else {
                    if ( _.isEmpty(localStorage[params.key]) ) {
                        setLists({meta:params, data:{}});
                        localStorage[params.key] = JSON.stringify(scope.list);
                    } else {
                        setLists(JSON.parse(localStorage[params.key]));
                    }
                 }
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
            //template : '<input type="text" ng-model="field" ng-change="chg(id, i)" ng-click="clk(id)" />',
            templateUrl : 'html/grid/textInput.html',
            link: function(scope, el) {
                el.bind('blur', scope.blr);
            },

            controller: function($scope, $element, $attrs) {
                var rScope = $scope.$parent.$parent;
                rScope.$parent.rScope = rScope; // in grid scope

                $scope.blr = function() {
                    rScope.trClass = isDirty(rScope.id) ? 'dirty' : '';
                };

                $scope.clk = function(id) {
                    rScope.trClass = 'selected' + (isDirty(id) ? ' dirty' : '');   
                };

                $scope.chg = function(id, i) {
                    $scope.listW.data[id][i] = $scope.field;
                    rScope.dirty = isDirty(id);
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
            templateUrl : 'html/grid/main.html',
            controller:  function($scope, $element, $attrs) {
                $scope.rScope = null;

                gridDataSrv.get($attrs, $scope);

                $scope.sav = function(id, rScope) {
                    rScope.dirty = false;
                    rScope.trClass = '';
                    $scope.list.data[id] = angular.copy($scope.listW.data[id]);
                    gridDataSrv.sav($attrs.key, $scope.list);
                };

                $scope.del = function(id)  { 
                    delete $scope.list.data[id];
                    gridDataSrv.sav($attrs.key, $scope.list);
                };

                $scope.reload = function() { 
                    $scope.listW = angular.copy($scope.list); 
                    $scope.list  = angular.copy($scope.list); // Need to refresh list to re-render from original data
                };                                            // TODO: there's gotta be a better way

                $scope.add = function() {
                    var newIdx = _($scope.list.data).minIntKey(-1);

                    $scope.list.data[newIdx]  = _.mkEmpty($scope.list.meta.columns);
                    $scope.listW.data[newIdx] = _.mkEmpty($scope.list.meta.columns);
                    setTimeout(
                        function () { $scope.rScope.trClass = 'selected'; $scope.rScope.$digest(); }, 100
                    );
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
