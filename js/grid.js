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
                'continent'  : {
                    'url'      : 'data/cluster.php',
                    'columns'  : ['Name', '# of Countries' , 'Population'],
                    'children' : {
                        'country' : {
                            'columns' : ['Name', 'Area','Population'],
                            'children' : {
                                'region' : {
                                    'columns' : ['Designation', 'Timezone', 'Size', 'Population'],
                                    'children' : {
                                        'town' : {
                                            'columns' : ['Name', 'Size', 'Population'],
                                            'children' : {
                                                'hood' : {
                                                    'columns' : ['Name', 'Size', 'Population', 'Number of Units'],
                                                    'children' : {
                                                        'address' : {
                                                            'columns' : ['Street', 'Number', 'Apt. Number', 'Room Number']
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'statistics' : {
                            'columns' : ['Type'], 
                            'children' : {
                                'population' : {
                                    'columns' : ['Type', 'Percentage', 'Language'],
                                    'children' : {
                                        'minorities' : {
                                            'columns' : ['Name', 'Percentage', 'Language']
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'managers' : {
                    'columns' : ['First', 'Last' , 'Email', 'Phone'],
                    'children': {
                        'division' : {
                            'columns' : ['Address', 'Phone', 'Branch'],
                            'children': {
                                'office' : {
                                    'columns' : ['Address', 'Phone', 'Contact Name']
                                }
                            }
                        },
                        'field' : {
                            'columns' : ['Location', 'Cell', 'Region']
                        }
                    }
                },
                'localstuff' : {
                    'columns' : ['First', 'Last' , 'Local']
                }
            },

            'tplUrls' : {
                'main'        : 'html/grid/main.html',
                'rowButtons'  : 'html/grid/rowButtons.html',
                'tdInput'     : 'html/grid/tdInput.html',
                'headButtons' : 'html/grid/headButtons.html'
            },

            getColumns:  function(key) { 
                return _.isUndefined(m = this.findMeta(key)) ? false : m.columns;  
            },
            getChildren: function(key) {
                return _.isUndefined(m = this.findMeta(key)) ? false : m.children; 
            },

            findMeta : function(key) {
                var keys = _.gridKey(key).split('/');
                var meta = _.deepCopy(this.meta[keys.shift()]);

                for (var i=0 ; i<keys.length ; i++ )
                    meta = meta.children[keys[i]];

                return meta;
            },

            getMeta : function(key, field) {
                var meta = this.findMeta(key);

                return _.isUndefined(meta) ? false
                                           : _.isUndefined(field) ? meta 
                                                                  : meta[field];
            }
        }
    })
;
angular.module('app.services', ['app.gridConf'])
    .factory('gridDataSrv', function($http,config) {
        return  {
            prefix: 'GRID:',

            clear: function(key) { 
                typeof key == 'undefined' ? localStorage.clear() : delete localStorage[key]; 
            },

            setParams : function(attrs, scope) {
                var $return = {key:attrs.key, columns:[], url:null};
                
                $return.columns = _.isUndefined(attrs.columns) ? config.getColumns(attrs.key)
                                                               : attrs.columns.split(',');
                $return.url     = _.isUndefined(attrs.url)     ? config.getMeta(attrs.key, 'url') 
                                                               : attrs.url;

                return _.isEmpty($return.columns) ? false : $return;
            },

            get: function(attrs, scope, cb) {
                function setLists(src){
                    scope.listW    = _.deepCopy( scope.list = src );
                    cb(scope.list);
                };

                var params = this.setParams(attrs, scope);

                if ( params.url )
                    $http.get(params.url).success( function(data) { 
                        setLists({data:data, meta:config.getMeta(params.key)});
                    });
                 else 
                    if ( _.isEmpty(localStorage[this.prefix + params.key]) )
                        setLists({meta:params, data:{}});
                    else {
                        if ( _.isUndefined(localStorage[this.prefix + params.key]) )
                            setLists({meta:params, data:{}});

                        setLists(JSON.parse(localStorage[this.prefix + params.key]));
                    }
            },

            sav: function(key, list, id) {
                localStorage[this.prefix + key] = JSON.stringify( list );
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
    .directive('tdInput', function factory(config) {
        return {
            replace  : true,
            restrict : 'E',
            scope: true,
            templateUrl : config.tplUrls.tdInput,
            link: function($scope, $element) {
                $element.bind('blur', $scope.blr);
            },

            controller: function($scope, $element, $attrs) {
                var rScope = $scope.$parent.$parent; // row scope

                $scope.blr = function() { rScope.blr();                                  };
                $scope.chg = function() { rScope.chg($scope.id, $scope.i, $scope.field); };
            }
        }
    })
    .directive('rowButtons', function factory($compile, config, gridDataSrv) { // row scope
        return {
            replace     : false,
            restrict    : 'A',
            templateUrl : config.tplUrls.rowButtons,
            link        : function($scope, $element) {
                            if (_.isEmpty(_.filter($scope.row, function(v,k) {return v !== '';}))) {
                                $scope.trClass = 'selected'; 
                                $scope.showSub = false;
                            };
            },
            controller  : function($scope, $element, $attrs) {
                $scope.showSub = config.getChildren($scope.$attrs.key);

                function isDirty() { 
                    return $scope.dirty 
                            = !_.isEmpty(_.filter($scope.row, function(v,k) { return v !== $scope.listW.data[$scope.id][k]; }));
                };

                $scope.blr = function() { 
                    $scope.trClass = isDirty() ? 'dirty' : '';
                };

                $scope.clk = function() {
                    $scope.trClass = 'selected' + (isDirty() ? ' dirty' : '');   
                };

                $scope.chg = function(id, i, field) {
                    $scope.listW.data[id][i] = field;
                    $scope.clk();
                };

                $scope.sav = function() {
                    $scope.list.data[$scope.id] = _.deepCopy($scope.listW.data[$scope.id]);
                    $scope.notify('sav', gridDataSrv.sav($scope.$attrs.key, $scope.list));
                    $scope.blr();
                };

                $scope.del = function()  { 
                    delete $scope.list.data[$scope.id];
                    $scope.notify('', gridDataSrv.sav($scope.$attrs.key, $scope.list), 'Deleting row with id <b>' + $scope.id + '</b>');
                };

                $scope.sub = function() {
                    _(config.getMeta($scope.$attrs.key).children).each( function(v,k) { 
                        this.key = $scope.$attrs.key + '/' + $scope.id + '/' + k;

                        tableEl().after($compile('<grid key="' + this.key + '" child>')($scope));
                    });

                    if (!_.isUndefined(key)) setSubPane();
                };

                $scope.exp = function() {
                    setSubPane();
                    tableEl().after( "<input type='button' value='X' onclick='console.log(this)'/>" );
                };

                function setSubPane() {
                    var pScope = $scope.$parent;
                    pScope.workRow = '{' + _($scope.list.data[$scope.id]).map( function(v,k) { return v }).join(', ') + '}';
                    pScope.tableHide = pScope.tableHide ? false : 'showTable';
                };

                function tableEl()  { return $element.parent().parent().parent(); }
            }
        }
    })
    .directive('headButtons', function factory(gridDataSrv, config) { // head scope
        return {
            replace  : false,
            restrict : 'C',
            templateUrl : config.tplUrls.headButtons,
            link        : function($scope, $attrs) {
                gridDataSrv.get($scope.$attrs, $scope, function( listData ) {
                    if ( _.isEmpty(listData.data) ) {
                        $scope.tableHide = 'showTable';
                        if ( !_.isUndefined($scope.$attrs.child) ) 
                            $scope.add();
                        else
                            $scope.notify('','info', 'Please click on the "+" sign to add rows', 5);
                    }
                });

                ($scope.spaces = _.gridKey($scope.$attrs.key).split('/')).pop();
            },
            controller  : function($scope, $element, $attrs ) {
                $scope.toggleTable = function(sc) {
                    $scope.tableHide = $scope.tableHide ? $scope.restore() : 'showTable';
                };

                $scope.reload = function() { 
                    $scope.list  = _($scope.list).deepCopy($scope.listW);
                    $scope.notify('rel', 'success', _.isEmpty($scope.list.data) ? ' (empty)' : '');
                    if ($scope.tableHide) $scope.toggleTable();
                };

                $scope.add = function() {
                    var newIdx = _($scope.list.data).minIntKey(-1);

                    $scope.list.data[newIdx]  = _.mkEmpty($scope.list.meta.columns, '');
                    $scope.listW.data[newIdx] = _.mkEmpty($scope.list.meta.columns, '');
                    if ($scope.tableHide) { 
                        $scope.showSub = true;
                        $scope.tableHide = false;
                    }
                };
            }
        }
    })
    .directive('grid', function factory(gridDataSrv, config) {
        return {
            replace     : false,
            restrict    : 'E',
            scope       : {},
            templateUrl : config.tplUrls.main,
            link        : function($scope, $element, $attrs) {
                // Attributes inherited and shared by row Scope and head Scope
                $scope.$attrs    = $attrs;
                $scope.tableHide = false;
                $scope.workRow   = '';
                $scope.list,
                $scope.listW     = {};
            },
            controller  :  function($scope, $element, $attrs) {
                $scope.restore = function( a ) {
                    $element.find('grid').remove();
                    return $scope.workRow = '';
                }
            }
        }
    })
    .directive('notify', function factory() {
        return {
            restrict   : 'C',
            replace    : true,
            scope      : true,
            controller : function($scope, $element) {

                $scope.$parent.notify = function(msgId, type, msg, howLong) {
                    if ( _.isUndefined(type)) type = 'info';
                    if ( _.isUndefined(msg))  msg  = '';

                    switch (msgId) {
                        case 'sav' : flash('Saving Row.'      + msg, type, howLong); break;
                        case 'rel' : flash('Reloading Table.' + msg, type, howLong); break;
                        default    : flash(                     msg, type, howLong); break;
                    }
                };

                function flash(msg, type, howLong) {
                    var colors = {"success":"green", "warn":"#a80", "error":"red", "info":"#888"};

                    if (_.isUndefined(howLong)) howLong = 1;

                    $element.html('<b><i>' + _(type).camelize() + ':</i></b> ' + msg)
                            .css( {display:"block", color:colors[type]} );

                    setTimeout(function() {$element.css({display:"none"})}, 2000*howLong);
                };
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
    .filter('last', function() {
        return function(input, delim) {
            return input.split(_.isUndefined(delim) ? '/' : delim).pop();
        }
    })
    .filter('Last', function() {
        return function(input, delim) {
            var last = input.split(_.isUndefined(delim) ? '/' : delim).pop();
            return last.charAt(0).toUpperCase() + last.substr(1);
        }
    })

;
//  Directives END

angular.module('app', ['app.services', 'app.directives']);
