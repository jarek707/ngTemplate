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
                'management' : {
                    'columns' : ['First Name', 'Last Name', 'Active:4:R:Yes,No', 'Description:3/:TA', 'Location:5/:S:static/location']

                },
                'continent'  : {
                    'url'      : 'data/cluster.php',
                    'columns'  : ['Name', '# of Countries' , 'Population', 'Image:3/'],
                    'children' : {
                        'country' : {
                            'columns' : ['Name', 'Area','Population', 'Active:3:R:Yes:No'],
                            'children' : {
                                'region' : {
                                    'columns' : ['Designation:M', 'Timezone:M', 'Size:M', 'Population:M'],
                                    'children' : {
                                        'town' : {
                                            'columns' : ['Name:M', 'Size:M', 'Population:M'],
                                            'children' : {
                                                'hood' : {
                                                    'columns' : ['Name:M', 'Size:M', 'Population:M', 'Number of Units:M'],
                                                    'children' : {
                                                        'address' : {
                                                            'columns' : ['Street:M', 'Number:M', 'Apt. Number:M', 'Room Number:M']
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
                            'columns' : ['Type','Range'], 
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
                'tdRadio'     : 'html/grid/tdRadio.html',
                'headButtons' : 'html/grid/headButtons.html',
                'textInput'   : 'html/grid/TEXT.html'
            },

            getAllColumns:  function(key) { 
                return this.findMeta(key).columns;
            },

            getTabColumns:  function(key) { 
                var colNames = [], colsA = [], tabPos='';

                _(this.findMeta(key).columns).each( function(v,k) {
                    colsA = v.split(':');
                    if ( _.isUndefined(colsA[1]) || _.isUndefined(colsA[1].split('/')[1]) )
                        colNames.push(colsA[0]);
                });
                return colNames;
            },

            getChildren: function(key) {
                return _.isUndefined(m = this.findMeta(key)) ? false : m.children; 
            },

            getInputMeta: function(key, idx) {
                var meta = this.getMeta(key,true).columns[idx].split(':');
                var $return = {};

                switch (meta.length) {
                    case 4: $return.labs = meta[3].split(',');
                    case 3: $return.type = meta[2];
                    case 2: $return.pos  = meta[1];
                    case 1: $return.name = meta[0];
                }
                return $return;
            },

            findMeta : function(key) {
                var keys = _.gridKey(key).split('/');
                var meta = _.deepCopy(this.meta[keys.shift()]);

                for (var i=0 ; i<keys.length ; i++ )
                    meta = meta.children[keys[i]];

                return meta;
            },

            getMeta : function(key, allCols) {
                var meta = this.findMeta(key);

                if (_.isUndefined(meta))
                    return false;
                else {
                    meta.columns = _.isUndefined(allCols)   ? this.getTabColumns(key) 
                                                            : this.getAllColumns(key);
                    return meta;
                }
            }
        }
    })
;
angular.module('app.services', ['app.gridConf'])
    .factory('gridDataSrv', function($http,config) {
        return  {
            prefix: 'GRID:',

            clear: function(key) { 
                _.isUndefined(key) ? localStorage.clear() : delete localStorage[key]; 
            },

            setParams : function(attrs, scope) {
                var $return = {key:attrs.key, columns:[], url:null};
                
                $return.columns = config.getTabColumns(attrs.key);
                $return.url     = _.isUndefined(attrs.url) ? config.getMeta(attrs.key).url 
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
            scope    : true, 
            templateUrl : config.tplUrls.tdInput,
            link    : function($scope, $element) {
                $element.bind('blur', $scope.blr);
            }
        }
    })
    .directive('tdRadio', function factory(config) {
        return {
            replace  : true,
            restrict : 'E',
            scope    : true, 
            transclude : true, 
            templateUrl : config.tplUrls.tdRadio,
            link    : function($scope, $element) {
                $element.bind('blur', $scope.blr);
            },
            controller: function($scope, $attrs, $element) {
                $scope.clk = function(id,i,k) {
                    $scope.listW.data[id][i] = k;
                    $scope.$parent.clk();
                }
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
                $scope.getType = function(id,i) {
                    $scope.radioBtns = {};
                    var meta = config.getInputMeta( $scope.$attrs.key, i ); 
                    $scope.radioBtns = meta.labs;
                    $scope.standard = meta.type ? 'notext' : '';
                    return _.isUndefined(meta.type) ? 'T' : meta.type;
                };

                $scope.showSub = config.getChildren($scope.$attrs.key);

                function isDirty() { 
                    return $scope.dirty = !_($scope.row).isEqual($scope.listW.data[$scope.id]);
                };

                $scope.blr = function() { 
                    $scope.trClass = isDirty() ? 'dirty' : '';
                };

                $scope.clk = function(i) {
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
                    _(config.getMeta($scope.$attrs.key).children, true).each( function(v,k) { 
                        this.key = $scope.$attrs.key + '/' + $scope.id + '/' + k;

                        tableEl().after($compile('<grid key="' + this.key + '" child>')($scope));
                    });

                    if (!_.isUndefined(key)) $scope.$emit('openSub', $scope.id);
                };

                $scope.exp = function() {
                    var tpl = '';
                    _(config.getMeta($scope.$attrs.key,true).columns).each( function(v,k) {
                        var colDefs = v.split(':');
                        switch (colDefs[2]) {
                            case 'TA' :
                                tpl += '<textarea-input></textarea-input>';
                                break;
                            case 'R' :
                                tpl += '<radio-input></radio-input>';
                                break;
                            case 'C' :
                                tpl += '<checkbox-input></select-input>';
                                break;
                            case 'S' :
                                tpl += '<select-input></select-input>';
                                break;
                            default: 
                                tpl += '<text-input></text-input>';
                                break;
                        }

                    });
                    $scope.$emit('openSub', $scope.id);
                };

                function tableEl()  { return $element.parent().parent().parent(); }
            }
        }
    })
    .directive('textInput', function factory(gridDataSrv, config) { // head scope
        return {
            replace : true,
            restrict : 'C',
            templateUrl : config.tplUrls.textInput
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
                        $scope.tableHide = 'hidden';
                        if ( !_.isUndefined($scope.$attrs.child) ) 
                            $scope.add();
                        else
                            $scope.notify('','info', 'Please click on the "+" sign to add rows', 5);
                    }
                });

                ($scope.spaces = _.gridKey($scope.$attrs.key).split('/')).pop();
            },
            controller  : function($scope, $element, $attrs ) {
                $scope.peekTable = function() {
                    $scope.tableHide = $scope.tableHide ? false : 'hidden';
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
    .directive('test', function factory(gridDataSrv, config) {
        return {
            replace     : false,
            restrict    : 'E',
            scope       : { lth : '=' },
            template    : '<div sid="{{$id}}">TESTING{{lth}}<input type="button" value="X...X" ng-click="set()"</div>',
            link        : function($scope, $element, $attrs) {
                $scope.$watch('lth', function(a,b,scope) {
                }, true);
            },
            controller  :  function($scope, $element, $attrs) {
                $scope.set = function() {
                    $scope.lth='hidden';
                };

                $scope.$$_name = 'test';
            }
        }
    })
    .directive('grid', function factory(gridDataSrv, config) {
        return {
            replace     : false,
            restrict    : 'E',
            scope       : {},
            templateUrl : config.tplUrls.main,
            transclude  : true,
            link        : function($scope, $element, $attrs) {
                // Attributes inherited and shared by row Scope and head Scope
                $scope.$attrs    = $attrs;
                $scope.tableHide = false;
                $scope.workRow   = '';
                $scope.list,
                $scope.listW     = {};
                $scope.$$_name = 'grid';
                $scope.$on('openSub', function(arg, listId) {
                    var SC       = arg.currentScope;
                    SC.tableHide = SC.tableHide ? false : 'hidden';
                    SC.workRow   = '{' + _(SC.list.data[listId]).map( function(v,k) { return v }).join(', ') + '}';
                    arg.stopPropagation();
                });
            },
            controller  :  function($scope, $element, $attrs) {
                $scope.trClass = 'none';

                $scope.restore = function( a ) {
                    $element.find('grid').remove();
                    $scope.tableHide = false;
                    return $scope.workRow = '';
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
    .filter('colName', function() {
        return function(input, delim) {
            return input.split(_.isUndefined(delim) ? ':' : delim).shift();
        }
    })


;
//  Directives END

angular.module('app', ['app.services', 'app.directives']);
