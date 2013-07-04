// GLOBAL Utility START
function SER(arg) { return JSON.stringify(arg); }
function LG()     { console.log(arguments);     }
function LGT()    { var args  = _.map(arguments, function(v,k) {return v});
                    setTimeout(function() {console.log(args);}, args.pop()); }
// GLOBAL Utility END

//
// Service Modules START
//
angular.module('app.gridConf', [])
    .factory('config', function() {
        return {
            'meta' : {
                'cluster'  : {
                    'url'      : 'data/cluster.php',
                    'columns'  : ['Name', 'Age' , 'Number'],
                    'children' : {
                        'system' : {
                            'columns' : ['Name', 'Position','Orientation']
                        },
                        'observers' : {
                            'columns' : ['First', 'Last','Contact']
                        }
                    }
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
                return 'success';
            }
        }
    })
;
// Service Modules END

//
//  Directives START
//
angular.module('app.directives', ['app.gridConf'])
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
    .directive('trButtons', function factory($compile) {
        return {
            replace  :false,
            restrict : 'A',
            templateUrl : 'html/grid/trButtons.html',
            controller  : function($scope, $element, $attrs) {

                $scope.sub = function(id) {
                    tableEl().find('tr').css({"display":"none"});
                    $scope.$parent.workRow = 
                        _($scope.list.data[id]).map( function(v,k) { return v }).join(':');

                    var el = $compile('<grid key="z123" columns="One,two"></grid>')($scope);
                    LG( $scope.getGridEl() );

                    $element.parent().parent().parent().after(el);
                };

                $scope.exp = function(id, el) {
                    insertHtml(
                        '<div>stuff here</div>'
                    );
                };

                function insertHtml(html) { 
                    $element.parent().parent().find('tr').css({"display":"none"});
                    var tab = $element.parent().parent().parent();
                    tab.after( html + "<input type='button' value='X' onclick='console.log(this)'/>" );
                }; 

                function restoreHtml() {
                    $element.parent().parent().find('tr').css({"display":"table-row"});
                }

                function tableEl() { return $element.parent().parent().parent(); }

            }
        }
    })
    .directive('grid', function factory(gridDataSrv, config) {
        return {
            replace     : false,
            restrict    : 'E',
            scope       : {},
            templateUrl : 'html/grid/main.html',
            link        : function($scope, $element) {
                $element.css( {"display": _.isUndefined($scope.list) ? "none" : "block"} );
            },
            controller  :  function($scope, $element, $attrs) {
                $scope.rScope = null; // row Scope
                $scope.restore = function() {
                    $element.find('tr').css({"display" : "table-row"});
                    var inGrid = $element.find('grid');
                }

                gridDataSrv.get($attrs, $scope);

                $scope.key = _($attrs.key).camelize();

                $scope.getGridEl  = function() { return $element; }

                $scope.sav = function(id, rScope) {

                    rScope.dirty         = false;
                    rScope.trClass       = '';

                    $scope.list.data[id] = angular.copy($scope.listW.data[id]);

                    $scope.notify('sav', gridDataSrv.sav($attrs.key, $scope.list));
                };

                $scope.del = function(id)  { 
                    delete $scope.list.data[id];
                    $scope.notify('', gridDataSrv.sav($attrs.key, $scope.list), 'Deleting row with id <b>' + id + '</b>');
                    
                };

                $scope.reload = function() { 

                    $scope.listW = angular.copy($scope.list); 
                    $scope.list  = angular.copy($scope.list); // Need to refresh list to re-render from original data
                    $scope.notify('rel', 'success', _.isEmpty($scope.list.data) ? ' (empty)' : '');
                };

                $scope.add = function() {
                    var newIdx = _($scope.list.data).minIntKey(-1);

                    $scope.list.data[newIdx]  = _.mkEmpty($scope.list.meta.columns, '');
                    $scope.listW.data[newIdx] = _.mkEmpty($scope.list.meta.columns, '');
                    setTimeout(
                        function () {$scope.rScope.trClass = 'selected'; $scope.rScope.$digest();}, 100
                    );
                };
            }
        }
    })
    .directive('notify', function factory() {
        return {
            restrict   : 'C',
            replace    : true,
            scope      : true,
            controller : function($scope, $element) {

                $scope.$parent.notify = function(msgId, type, msg) {
                    if ( _.isUndefined(type)) type = 'info';
                    if ( _.isUndefined(msg))  msg  = '';

                    switch (msgId) {
                        case 'sav' : flash('Saving Row.'      + msg, type); break;
                        case 'rel' : flash('Reloading Table.' + msg, type); break;
                        default    : flash(                     msg, type); break;
                    }
                };

                function flash(msg, type, howLong) {
                    var colors = {"success":"green", "warn":"#a80", "error":"red", "info":"blue"};

                    if (_.isUndefined(howLong)) howLong = 1;

                    $element.html('<b><i>' + _(type).camelize() + ':</i></b> ' + msg)
                            .css( {display:"block", color:colors[type]} );

                    setTimeout(function() {$element.css({display:"none"})}, 2000*howLong);
                };

                setTimeout(function() {     if (_.isEmpty($scope.list.data))
                                                flash("Please click on the '+' icon to add rows", 'info', 3);
                                      }, 300);
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
    .directive('imgInput', function factory() {
        return {
            restrict:   'E',
            template:   '<div class="imgPar"><img ng-src="{{src}}" align="left" width="80" height="100"/><p>{{content}}</p></div>',
            transclude: true,
            replace:    true,
            controller : function($scope, $element, $attrs) {
                $scope.src = 'shot.png';
                $scope.content ='Lorem ipsum dolor bla, bla, bla, bla, bla, bla, bla, bla, ... Lorem ipsum dolor bla, bla, bla, bla, bla, bla, bla, bla, ... Lorem ipsum dolor bla, bla, bla, bla, bla, bla, bla, bla, ... Lorem ipsum dolor bla, bla, bla, bla, bla, bla, bla, bla, ... Lorem ipsum dolor bla, bla, bla, bla, bla, bla, bla, bla, ... ';
                //$scope.content ='Lorem ipsum dolor bla, bla, bla, bla, bla, bla';
            }
        }
        
    })
;
//  Directives END

angular.module('app', ['app.services', 'app.directives']);
