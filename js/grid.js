angular.module('app.directives', ['app.gridConf'])
    .directive('tdTest', function factory(config) {
        return {
            restrict    : 'A',
            replace     : true,
            template    : "<div><input ng-model='field' ng-change='$parent.chg(i, field)' ng-click='$parent.clk()' ></input></div>"
        }
    })
    .directive('tdText', function factory(config) {
        return {
            restrict    : 'A',
            replace     : true,
            transclude  : true,
            templateUrl : config.tplUrls.tdText,
            link        : function($scope) { 
                $scope.meta = $scope.meta[$scope.metaType][$scope.i]; 
                $scope.chg  = function(i) { 
                    LG( $scope.meta );
                    $scope.$parent.chg($scope.meta.pos, $scope.field) 
                };
            }
        }
    })
    .directive('tdRadio', function factory(config) {
        return {
            restrict    : 'EA',
            replace     : true,
            transclude  : true,
            templateUrl : config.tplUrls.tdRadio,
            link        : function($scope) { 
                $scope.meta = $scope.meta[$scope.metaType][$scope.i]; 
                $scope.chg  = function(i) { $scope.$parent.chg($scope.meta.pos) };
            }
        }
    })
    .directive('tdCheckbox', function factory(config) {
        return {
            replace     : true,
            restrict    : 'EA',
            transclude  : true,
            templateUrl : config.tplUrls.tdCheckbox,
            link        : function($scope, $element) { // link function
                $scope.values = [];
                $scope.meta   = $scope.meta[$scope.metaType][$scope.i];

                //$scope.workRow[$scope.meta.pos] = JSON.parse($scope.workRow[$scope.meta.pos]);
                if ( typeof $scope.workRow[$scope.meta.pos] != 'object' )
                    $scope.workRow[$scope.meta.pos] = [ true, false, false ]
                if ( typeof $scope.row[$scope.meta.pos] != 'object' )
                    $scope.row[$scope.meta.pos] = [ true, false, false ]
            },
            controller: function($scope, $attrs, $element) {

                $scope.chg = function(i) {
                    $scope.$parent.chg($scope.meta.pos);
                };

                $scope.sav = function() {
                    //$scope.workRow[$scope.meta.pos] = JSON.stringify($scope.workRow[$scope.meta.pos]);
                    $scope.$parent.sav();
                }
            }
        }
    })
    .directive('tdSelect', function factory(config) {
        return {
            replace  : true,
            restrict : 'EA',
            scope    : true, 
            transclude  : true,
            templateUrl : config.tplUrls.tdSelect,
            link    : function($scope, $element) {
                $scope.meta      = $scope.meta[$scope.metaType][$scope.i];
            },
            controller: function($scope) {
                $scope.chg = function(i) {
                    $scope.$parent.chg($scope.meta.pos);
                };
            }
        }
    })
    .directive('rowButtons', function factory(config, gridDataSrv, rel) { // row scope
        return {
            replace     : false,
            restrict    : 'A',
            templateUrl : config.tplUrls.rowButtons,
            link        : function($scope, $element) {
                if (_.isEmpty(_.filter($scope.row, function(v,k) {return v !== '';}))) {
                    $scope.trClass = 'selected'; 
                    $scope.showSub = false;
                } else {
                    $scope.showSub = config.getChildren($scope.$attrs.key);
                }

                //$scope.workRow = _.clone($scope.row);
                $scope.workRow = angular.copy($scope.row);
            },
            controller  : function($scope, $element, $attrs) {
                $scope.meta    = $scope.$parent.meta.columns;
                $scope.metaType = 'tab';

                function isDirty() { 
                    return $scope.dirty = !_($scope.row).isEqual($scope.workRow);
                };

                var rowDataLabel = function() { 
                    return _($scope.workRow).filter( function(v,k) {
                        if (!_.isUndefined($scope.meta.tab[k]))
                            return $scope.meta.tab[k].type == 'T' ? v : false;
                    }).join(', ');
                }

                $scope.getTdClass = function(i) {
                    return $scope.meta.tab[i].type == 'T' ? '' : 'notext';
                };

                $scope.blr = function() { 
                    $scope.trClass = isDirty() ? 'dirty' : '';
                };

                $scope.clk = function() {
                    $scope.closeLastRow($scope);
                    $scope.trClass = 'selected' + (isDirty() ? ' dirty' : '');   
                };
                
                $scope.chg = function(idx) {
                    $scope.clk();
                };

                $scope.sav = function() {
                    $scope.$parent.sav($scope.workRow, $scope.id);
                    $scope.trClass = '';
                };

                $scope.del = function() {
                    $scope.$parent.del($scope.id);
                }

                $scope.sub = function() {
                    rel.use($scope.$parent.meta.rel, 'sub', function() {
                        $scope.$parent.sub($scope, rowDataLabel());
                    });
                };

                $scope.detail = function() {
                    rel.use($scope.$parent.meta.rel, 'detail', function() {
                        $scope.$parent.detail($scope, rowDataLabel());
                    });
                };
            }
        }
    })
    .directive('headButtons', function factory(gridDataSrv, config) { // head scope
        return {
            replace  : false,
            restrict : 'C',
            templateUrl : config.tplUrls.headButtons,
            link        : function($scope, $attrs) {
                ($scope.spaces = UT.gridKey($scope.$attrs.key).split('/')).pop();
            },
            controller  : function($scope, $element, $attrs ) {
                $scope.peekTable = function() {
                    $scope.tableHide = $scope.tableHide ? false : 'hidden';
                };

                $scope.reload = function() { 
                    $scope.list  = UT.dobuleCopy($scope.list, $scope.listW);
                    $scope.notify('rel', 'success', _.isEmpty($scope.list) ? ' (empty)' : '');
                    if ($scope.tableHide) $scope.toggleTable();
                };
                $scope.headVar = 'var';
            }
        }
    })
    .directive('grid', function factory($compile, gridDataSrv, config, rel) {
        return {
            replace     : false,
            restrict    : 'AE',
            scope       : { parentDataFn : '&', configObject : "@config"},
            transclude  : true,
            templateUrl : config.tplUrls.main,
            compile     : function(el, attrs, trans) {
                if (!config.setConfigObject(attrs.config)) {
                    el.remove();
                    alert('Config object "' + attrs.config + '" is not defined'); 
                    return false;
                } else {
                    return  function($scope, $element, $attrs) {

                        // Attributes inherited and shared by row Scope and head Scope
                        $scope.meta      = config.getMeta($attrs.key);
                        $scope.ngRepeatColumnLimit = $scope.meta.columns.tab.length;

                        $scope.row = [];
                        $scope.lastRowScope = null;
                        $scope.$attrs    = $attrs;
                        $scope.tableHide = false;
                        $scope.list      = {};
                        $scope.listW     = {};
                        $scope.headHide  = $scope.meta.headHide;

                        $scope.commonObject = {};

                        $scope.parentData = function(dataItem) {
                            return $scope[dataItem];
                        };

                        gridDataSrv.get($scope.$attrs, $scope, function( listData ) {
                            if ( _.isEmpty(listData.data) ) {
                                $scope.tableHide = true && $scope.meta.autoHide;
                                if ( !_.isUndefined($scope.$attrs.child) ) 
                                    $scope.add();
                            }
                        });

                        if (!_.isUndefined($scope.meta.rel)) 
                            rel[$scope.meta.rel].init($scope, $element);
                    }
                }
            },
            controller  :  function($scope, $element, $attrs) {

                $scope.restore = function( a ) {
                    $element.find('grid').remove();
                    $scope.tableHide = false;
                    return $scope.rowContent = '';
                };

                $scope.closeLastRow = function(rowScope) {
                   if ( $scope.lastRowScope )
                       $scope.lastRowScope.blr();

                   $scope.lastRowScope = rowScope;
                };

                // Sub panes BEGIN
                $scope.openSub = function(rowData) {
                    $scope.tableHide  = $scope.meta.autoHide;
                    $scope.rowContent = '{' + rowData + '}';
                };

                $scope.sub = function(rowScope, workRow) {
                    _(config.getChildren($attrs.key)).each( function(v, childKey) { 
                        $scope.after(
                            '<div grid key="' + $attrs.key + '/' + rowScope.id + '/' + childKey + '" '
                            + 'config="' + $scope.configObject + '" '
                            + 'parent-data-fn="parentData(data)"></div>', rowScope
                        );
                    });
                    $scope.openSub(workRow);
                };

                $scope.detail = function(rowScope, rowText) {
                    $scope.closeLastRow(rowScope);
                    $scope.row = rowScope.workRow;
                    $scope.after(
                        '<div detail key="' + $attrs.key + '/' + rowScope.id + '/"></div>', rowScope

                    );
                    $scope.openSub(rowText);
                };

                $scope.after = function(html, rowScope) {
                    if ( $element.find('table').parent().children().length > 2) 
                        $element.find('table').next().remove();

                    $element.find('table').after($compile(html)(rowScope));
                }
                // Sub panes END

                // Row data methods BEGIN
                $scope.add = function() {
                    var newIdx = UT.minIntKey($scope.list, -1);

                    $scope.list[newIdx]  = UT.mkEmpty($scope.meta.columns.all, '');
                    $scope.listW[newIdx] = UT.mkEmpty($scope.meta.columns.all, '');

                    $scope.closeLastRow(null);
                    $scope.tableHide = false;
                };

                $scope.sav = function(row, id) {
                    $scope.list[id] = _.clone(row);
                    $scope.notify(  'sav', gridDataSrv.sav($attrs, $scope.list, id));
                };

                $scope.del = function(id)  { 
                    var info = $scope.list[id].shift();
                    delete $scope.list[id];
                    $scope.notify( 'del', gridDataSrv.sav($attrs, $scope.list), ' <b>"' + info + '"</b>');
                };
                // Row data methods END
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
                        case 'del' : flash('Deleting Row'     + msg, type, howLong); break;
                        default    : flash(                     msg, type, howLong); break;
                    }
                };

                function flash(msg, type, howLong) {
                    var colors = {"success":"green", "warn":"#a80", "error":"red", "info":"#888"};

                    if (_.isUndefined(howLong)) howLong = 1;

                    $element.html('<b><i>' + UT.camelize(type, true) + ':</i></b> ' + msg)
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
    .filter('toLabel', function() {
        return function(input, labels, type) {
            if ( _.isUndefined(input)) input = '';

            if (input === '' || input === []) {
                return '--none--';
            } else {
                var $return = '';
                if ( type == 'chk' ) {
                    _(input).each(function(v,k) {
                        $return += v ? ',' + labels[k] : '';
                    });
                } else {
                    _(input.toString().split(',')).each( function(v,k) {
                        $return += ',' + (!_.isUndefined(type) && type == 'sel' ? labels[v].val : labels[v]);
                    });
                }

                return $return.substr(1);
            }
        }
    })
;
//  Directives END

angular.module('app', ['app.services', 'app.directives', 'app.customDirectives']);
