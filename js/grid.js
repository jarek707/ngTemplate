angular.module('app.directives', ['app.gridConf'])
    .directive('tdText', function factory(config) {
        return {
            restrict    : 'A',
            replace     : true,
            templateUrl : config.tplUrls.tdText,
        }
    })
    .directive('tdRadio', function factory(config) {
        return {
            restrict    : 'EA',
            replace     : true,
            templateUrl : config.tplUrls.tdRadio,
            link        : function($scope) { $scope.meta = $scope.meta[$scope.i]; }
        }
    })
    .directive('tdCheckbox', function factory(config) {
        return {
            replace     : true,
            restrict    : 'EA',
            scope       : true, 
            transclude  : true, 
            templateUrl : config.tplUrls.tdCheckbox,
            compile     : function(el, attrs, trans) {
                return function($scope, $element) { // link function
                    $scope.values = [];
                    $scope.meta   = $scope.meta[$scope.i];

                    $scope.mkLabGetVals($scope.field);
                }
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
            transclude : false, 
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
    .directive('rowButtons', function factory($compile, config, gridDataSrv) { // row scope
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
                $scope.workRow = _.clone($scope.row);
                $scope.meta = [];
            },
            controller  : function($scope, $element, $attrs) {
                function isDirty() { 
                    return $scope.dirty = !_($scope.row).isEqual($scope.workRow);
                };

                $scope.getType = function(i) {
                    var meta = config.getInputMeta( $scope.$attrs.key, i ); 
                    $scope.meta[i] = meta;
                    $scope.radioBtns = meta.labs;
                    return _.isUndefined(meta.type) ? 'T' : meta.type;
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
                    $scope.list.data[$scope.id] = UT.doubleCopy($scope.workRow);
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

                    if (!_.isUndefined(key)) $scope.$emit('openSub', $scope.workRow);
                };

                $scope.exp = function() {
                    var tpl = '';
                    _(config.getMeta($scope.$attrs.key,true).columns).each( function(v,k) {
                        var colDefs = v.split(':');
                        switch (colDefs[2]) {
                            case 'R'  : tpl += '<radio-input></radio-input>';       break;
                            case 'C'  : tpl += '<checkbox-input></checkbox-input>'; break;
                            case 'S'  : tpl += '<select-input></select-input>';     break;
                            case 'TA' : tpl += '<textarea-input></textarea-input>'; break;
                            default   : tpl += '<text-input></text-input>';         break;
                        }

                    });
                    $scope.$emit('openSub', $scope.workRow);
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
                ($scope.spaces = UT.gridKey($scope.$attrs.key).split('/')).pop();
            },
            controller  : function($scope, $element, $attrs ) {
                $scope.peekTable = function() {
                    $scope.tableHide = $scope.tableHide ? false : 'hidden';
                };

                $scope.reload = function() { 
                    $scope.list  = UT.dobuleCopy($scope.list, $scope.listW);
                    $scope.notify('rel', 'success', _.isEmpty($scope.list.data) ? ' (empty)' : '');
                    if ($scope.tableHide) $scope.toggleTable();
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
            transclude  : true,
            link        : function($scope, $element, $attrs) {
                // Attributes inherited and shared by row Scope and head Scope
                $scope.row = [];
                $scope.lastRowScope = null;
                $scope.$attrs    = $attrs;
                $scope.tableHide = false;
                $scope.list,
                $scope.listW     = {};

                gridDataSrv.get($scope.$attrs, $scope, function( listData ) {
                    if ( _.isEmpty(listData.data) ) {
                        $scope.tableHide = 'hidden';
                        if ( !_.isUndefined($scope.$attrs.child) ) 
                            $scope.add();
                        else
                            $scope.notify('','info', 'Please click on the "+" sign to add rows', 5);
                    }
                    LG( SER($scope.list.meta, ' meta' ));
                });

                $scope.$on('openSub', function(arg, rowData) {
                    $scope.tableHide = $scope.tableHide ? false : 'hidden';
                    $scope.workRow   = '{' + _(rowData).map( function(v,k) { return v }).join(', ') + '}';
                    arg.stopPropagation();
                });
            },
            controller  :  function($scope, $element, $attrs) {

                $scope.restore = function( a ) {
                    $element.find('grid').remove();
                    $scope.tableHide = false;
                    return $scope.workRow = '';
                };

                $scope.closeLastRow = function(rowScope) {
                   if ( $scope.lastRowScope )
                       $scope.lastRowScope.blr();

                   $scope.lastRowScope = rowScope;
                }

                $scope.add = function() {
                    var newIdx = UT.minIntKey($scope.list.data, -1);

                    $scope.list.data[newIdx]  = UT.mkEmpty($scope.list.meta.columns, '');
                    $scope.listW.data[newIdx] = UT.mkEmpty($scope.list.meta.columns, '');

                    $scope.closeLastRow(null);
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

angular.module('app', ['app.services', 'app.directives']);
