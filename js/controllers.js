angular.module('app.controllers', [])
    .service('row', function($http, config, $compile, rel) {
        return {
            'set' : function($scope) {
                this.controller($scope);
                if (!_.isUndefined($scope.$attrs.rel) && _.isFunction(this[$scope.$attrs.rel])) {
                    this[$scope.$attrs.rel]($scope);
                }
            },
            'friend'     : function($scope) {
                $scope.clk =  function() { // click on the member list
                    if (typeof $scope.$attrs.child == 'undefined') {
                        $scope.$parent.activeRowScope = $scope;

                        var html = 
                            "<div grid key='members/" + $scope.id + "/friend'"
                                + ' parent-data-fn="parentData(data)"'
                                + " config='PaneConfig' child></div>";

                        $scope.$parent.after(html, $scope.$parent);
                    }
                }

                var defaultFn = $scope.del;
                $scope.del = function(cb) { // deleting from child scope
                    if (typeof $scope.$attrs.child != 'undefined') {

                        var activeMember = $scope.parentDataFn({data: 'activeRowScope'});

                        for (var i=0; activeMember.workRow[1].length > i; i++) {
                            if ($scope.id == activeMember.workRow[1][i]) {
                                activeMember.workRow[1] = _(activeMember.workRow[1]).without($scope.id);
                                delete $scope.list[$scope.id];
                            }
                        }
                        activeMember.sav();
                    } else {
                        defaultFn();
                    }
                }
            },
            'controller' : function($scope) {
                $scope.meta     = $scope.$parent.meta.columns;
                $scope.metaType = 'tab';

                function isDirty() { 
                    return $scope.dirty = !_($scope.row).isEqual($scope.workRow);
                };

                function rowDataLabel() { 
                    return _($scope.workRow).filter( function(v,k) {
                        if (!_.isUndefined($scope.meta.tab[k]))
                            return $scope.meta.tab[k].type == 'T' ? v : false;
                    }).join(', ');
                }

                $scope.chg = function(idx) {
                    $scope.trClass = 'editable' + (isDirty() ? ' dirty' : '');   
                }

                $scope.getElementClass = function(i) {
                    return $scope.meta.tab[i].type == 'T' ? '' : 'notext';
                }

                $scope.blr = function() { 
                    if ($scope.trClass.indexOf('editable') > -1) {
                        $scope.trClass = $scope.trClass.replace('editable','');
                    }
                }
                
                // Relation functions START
                var relName = $scope.$parent.meta.rel;

                $scope.editRow = function() { // Usually on ng-Dblclick
                    rel.use(relName, 'editRow', function() { 
                        $scope.closeLastRow($scope);
                        $scope.chg();
                    }, $scope);
                }

                $scope.defaultClk = function(idx) {
                } 

                $scope.clkz = function(idx) {
                    rel.use(relName, 'clk', function() { $scope.defaultClk(idx); }, $scope);
                }

                $scope.sav = function() {
                    rel.use(relName, 'sav', function() { 
                        $scope.$parent.sav($scope.workRow, $scope.id);
                        $scope.trClass = '';
                    }, $scope);
                }

                $scope.del = function() {
                    $scope.$parent.del($scope.id);
                }

                $scope.sub = function() {
                    rel.use(relName, 'sub', function() {
                        $scope.$parent.sub($scope, rowDataLabel());
                    });
                }

                $scope.detail = function() {
                    rel.use(relName, 'detail', function() {
                        $scope.$parent.detail($scope, rowDataLabel());
                    }, $scope);
                }
                // Relation functions END
                
            }
        }
    })
    .service('head', function() {
        return {
            'controller' : function($scope) {
                $scope.peekTable = function() {
                    $scope.tableHide = $scope.tableHide ? false : 'hidden';
                }

                $scope.reload = function() { 
                    $scope.list  = UT.dobuleCopy($scope.list, $scope.listW);
                    $scope.notify('rel', 'success', _.isEmpty($scope.list) ? ' (empty)' : '');
                    if ($scope.tableHide) $scope.toggleTable();
                }
            }
        }
    })

;
angular.module('app.relations', ['app.gridConf'])
    .factory('rel', function($http,config, $compile) {
        return  {
            'use' : function(relKey, fnName, cb, args) {
                        if (!_.isUndefined(relKey)) 
                            var relObj = this[relKey];

                        if (!_.isUndefined(relObj) && _.isFunction(relObj[fnName])) 
                            relObj[fnName](args, cb);
                        else
                            if (_.isFunction(this.default[fnName]))
                                this['default'][fnName](args);
                            else
                                cb();
            },
            'friend' : {
                'mkList' : function(memberScope) {
                    var $return = {};
                    for (var i in memberScope.row[1])
                        $return[memberScope.row[1][i]] 
                            = [ memberScope.list[ memberScope.row[1][i]][0] ];

                    return $return;
                },
                'init' : function(scope, element, attrs) {
                    if (!_.isUndefined(scope.$attrs.child) ) {
                        scope.$parent.childGridScope = scope;
                        scope.list = this.mkList(scope.$parent.activeRowScope);

                        scope.id = scope.$attrs.key.split('/')[1];
                    }
                },
                'clk' : function(scope) { // click on the member list
                    if (typeof scope.$attrs.child == 'undefined') {
                        scope.$parent.activeRowScope = scope;

                        var html = 
                            "<div grid key='members/" + scope.id + "/friend'" 
                                + ' parent-data-fn="parentData(data)"'
                                + " config='PaneConfig' child></div>";

                        scope.$parent.after(html, scope.$parent);
                    }
                },
                'detail' :function(addScope) { // add friend to member
                    if (typeof addScope.$attrs.child == 'undefined') {
                        var memberRow = addScope.activeRowScope.workRow;
                        var addObj = {};
                        addObj[addScope.id] = addScope.row[0];


                        if ( _.isEmpty(memberRow[1])) { memberRow[1] = [addScope.id];
                        } else {                        memberRow[1].push(addScope.id); }

                        addScope.childGridScope.list[addScope.id] = [ addScope.row[0] ];
                        addScope.activeRowScope.sav();
                    }
                }, 
                'del' : function(scope, cb) { // deleting from child scope
                    if (typeof scope.$attrs.child != 'undefined') {

                        var activeMember = scope.parentDataFn({data: 'activeRowScope'});

                        for (var i=0; activeMember.workRow[1].length > i; i++) {
                            if (scope.id == activeMember.workRow[1][i]) {
                                activeMember.workRow[1] = _(activeMember.workRow[1]).without(scope.id);
                                delete scope.list[scope.id];
                            }
                        }
                        activeMember.sav();
                    } else {
                        cb();
                    }
                },
                'sav' : function(scope, cb) {
                    if (typeof scope.$attrs.child == 'undefined') cb();
                },
                // disable these buttons even if they don't show
                'editRow' :function(list) { }, 
                'sub' :function(list) { } 
            },
            'default' : {
                'clk' : function(args) {}
            }
        }
    })
;
