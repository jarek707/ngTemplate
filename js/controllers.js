angular.module('app.controllers', ['app.gridConf'])
    .service('row', function($http, config, $compile, rel, gridDataSrv) {
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
                                + " parent-data-fn='parentData(data)'  rel='friend'"
                                + " config='PaneConfig' child></div>";

                        $scope.$parent.after(html, $scope.$parent);
                    }
                }

                $scope.detail = function() { // add friend to member
                    if (typeof $scope.$attrs.child == 'undefined') {
                        var relationData = $scope.$parent.relationData;
                        var activeId     = $scope.activeRowScope.id;
                        
                        if (_.isUndefined(relationData[activeId]) || _.isEmpty(relationData[activeId]))
                            relationData[activeId] = [];

                        if (!_(relationData[activeId]).contains($scope.id)) {
                            relationData[activeId].push($scope.id);
                            gridDataSrv.sav({key: 'members/friend'}, relationData);
                            $scope.childGridScope.list[$scope.id] = [ $scope.row[0] ];
                        }
                    }
                } 

                var defaultFn = $scope.del;
                $scope.del = function(cb) { // deleting from child scope
                    if (typeof $scope.$attrs.child != 'undefined') {

                        var activeId     = $scope.parentDataFn({data: 'activeRowScope'}).id;
                        var relationData = $scope.parentDataFn({data: 'relationData'});

                        relationData[activeId] =_(relationData[activeId]).without($scope.id);
                        delete $scope.list[$scope.id];
                        gridDataSrv.sav({key: 'members/friend'}, relationData);
                    } else {
                        //TODO: traverse all fields and remove all references to the deleted id
                        delete $scope.relationData[$scope.id];
                        gridDataSrv.sav({key: 'members/friend'}, $scope.relationData);
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
                LG( 'default del ' );
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
