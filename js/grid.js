angular.module('app.directives', ['app.gridConf'])
    .directive('tdTest', function factory(config) {
        return {
            restrict    : 'A',
            replace     : true,
            template    : "<div><input ng-model='field' ng-change='$parent.chg(i, field)' ng-click='$parent.clk()' ></input></div>"
        }
    })
    .filter('toLabel', function() {
        return function(input, labels) {
            if (input == '') {
                return '--none--';
            } else {
                var $return = '';

                _(input.toString().split(',')).each( function(v,k) {
                    $return += ',' + labels[v];
                });

                return $return.substr(1);
            }
        }
    })
    .directive('tdText', function factory(config) {
        return {
            restrict    : 'A',
            replace     : true,
            transclude  : true,
            templateUrl : config.tplUrls.tdText
        }
    })
    .directive('tdRadio', function factory(config) {
        return {
            restrict    : 'EA',
            replace     : true,
            transclude  : true,
            templateUrl : config.tplUrls.tdRadio,
            link        : function($scope) { 
                $scope.meta = $scope.meta[$scope.i]; 
                //$scope.$watch('field', function() { LG( 'watching field in radio', $scope.field); });
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
                $scope.meta   = $scope.meta[$scope.i];

                $scope.mkLabGetVals($scope.field);
            },
            controller: function($scope, $attrs, $element) {

                $scope.mkLabGetVals = function (src) {
                    var keys = '', labs = '';

                    _.each($scope.meta.labs, function(v,k) {
                        if (src.toString().indexOf(k) > -1) { // LIMIT of 10
                            $scope.values[k] = true;
                            labs += ',' + v; 
                            keys += ',' + k;
                        }
                    });
                    $scope.labs = labs.substr(1);
                    if ( $scope.labs == '') $scope.labs = '-- none --';
                    return keys.substr(1);
                }

                $scope.chg = function(i) {
                    var checked = '';
                    _($scope.values).each( function(v,k) { if (v) checked += ',' + k });
                    $scope.field = $scope.mkLabGetVals(checked);
                    $scope.$parent.chg(i, $scope.field);
                };
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
                $scope.labs    = '';
                $scope.options = [{ 'id' : 3, 'val' : 'One' },
                                  { 'id' : 4, 'val' : 'Two' }];
                $scope.mkLabs();
            },
            controller: function($scope) {
                $scope.mkLabs = function(v,k) {
                    _.each($scope.options, function(v,k) {
                        if ($scope.field.toString().indexOf(v.id) > -1) 
                            $scope.labs = v.val; 
                    });
                    if ( $scope.labs == '') $scope.labs = '-- none --';
                };

                $scope.chg = function(i) {
                    $scope.mkLabs();
                    $scope.$parent.chg(i, $scope.field);
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

                $scope.meta    = $scope.$parent.meta.columns.all;
                $scope.workRow = _.clone($scope.row);
            },
            controller  : function($scope, $element, $attrs) {
                function isDirty() { 
                    return $scope.dirty = !_($scope.row).isEqual($scope.workRow);
                };

                var rowDataExtract = function() { 
                    return _($scope.workRow).map( function(v,k) {return v}).join(', ');
                }

                $scope.getType = function(i) {
                    return $scope.meta[i].type;
                };

                $scope.getTdClass = function(i) {
                    return $scope.getType(i) == 'T' ? '' : 'notext';
                };

                $scope.blr = function() { 
                    $scope.trClass = isDirty() ? 'dirty' : '';
                };

                $scope.clk = function() {
                    $scope.closeLastRow($scope);
                    $scope.trClass = 'selected' + (isDirty() ? ' dirty' : '');   
                };
                
                $scope.chg = function(i, field) {
                    $scope.workRow[i] = field;
                    $scope.clk();
                };

                $scope.sav = function() {
                    $scope.$parent.sav($scope.workRow, $scope.id);
                    $scope.blr();
                };

                $scope.del = function() {
                    $scope.$parent.del($scope.id);
                }

                $scope.sub = function() {
                    rel.use($scope.$parent.meta.rel, 'sub', function() {
                        $scope.$parent.sub($scope.id, rowDataExtract());
                    });
                };

                $scope.exp = function() {
                    rel.use($scope.$parent.meta.rel, 'exp', function() {
                        $scope.$parent.exp($scope.id, rowDataExtract(), $scope.workRow);
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
            }
        }
    })
    .directive('grid', function factory($compile, gridDataSrv, config, rel) {
        return {
            replace     : false,
            restrict    : 'AE',
            scope       : {},
            templateUrl : config.tplUrls.main,
            transclude  : true,
            link        : function($scope, $element, $attrs) {
                // Attributes inherited and shared by row Scope and head Scope
                $scope.meta      = config.getMeta($attrs.key);

                $scope.row = [];
                $scope.lastRowScope = null;
                $scope.$attrs    = $attrs;
                $scope.tableHide = false;
                $scope.list      = {};
                $scope.listW     = {};
                $scope.headHide  = $scope.meta.headHide;

                gridDataSrv.get($scope.$attrs, $scope, function( listData ) {
                    if ( _.isEmpty(listData.data) ) {
                        $scope.tableHide = true && $scope.meta.autoHide;
                        if ( !_.isUndefined($scope.$attrs.child) ) 
                            $scope.add();
                        else
                            $scope.notify('','info', 'Please click on the "+" sign to add rows', 5);
                    }
                });

                if (!_.isUndefined($scope.meta.rel)) 
                    rel[$scope.meta.rel].init($scope, $element);
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

                $scope.sub = function(rowId, workRow) {
                    _(config.getChildren($attrs.key)).each( function(v, childKey) { 
                        $scope.after(
                            '<div grid key="' + $attrs.key + '/' + rowId + '/' + childKey + '" child></div>'
                        );
                    });
                    $scope.openSub(workRow);
                };

                $scope.exp = function(rowId, workRow, row) {
                    $scope.row = row;
                    $scope.after(
                        '<div sub key="' + $attrs.key + '/' + rowId + '/"></div>'
                    );
                    $scope.openSub(workRow);
                };

                $scope.after = function(html) {
                    if ( $element.find('table').parent().children().length > 2) 
                        $element.find('table').next().remove();

                    $element.find('table').after($compile(html)($scope));
                }
                // Sub panes END

                // Row data methods BEGIN
                $scope.add = function() {
                    var newIdx = UT.minIntKey($scope.list, -1);

                    $scope.list[newIdx]  = UT.mkEmpty($scope.meta.columns.tab, '');
                    $scope.listW[newIdx] = UT.mkEmpty($scope.meta.columns.tab, '');

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


;
//  Directives END

angular.module('app', ['app.services', 'app.directives', 'app.customDirectives']);
