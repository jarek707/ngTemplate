angular.module('app.controllers', ['app.gridConf'])
    .service('row', function($http, config, $compile, rel, gridDataSrv) {
        return {
            'set' : function($scope, $element) {
                this.controller($scope);
                
                if (!_.isUndefined($scope.$attrs.rel) && _.isFunction(this[$scope.$attrs.rel]))
                    if (_.isUndefined($scope.$attrs.child))
                        this[$scope.$attrs.rel]($scope, $element);
                    else
                        this[$scope.$attrs.rel + '_child']($scope, $element);
            },
            'friend_child' : function($scope, $element) {
                
                $scope.del = function(cb) {
                    var activeId     = $scope.parentDataFn({data: 'activeRowScope'}).id;
                    var relationData = $scope.parentDataFn({data: 'relationData'});
                    relationData[activeId] = _(relationData[activeId]).without($scope.id);
                    if (true) // for mutual case
                        relationData[$scope.id] = _(relationData[$scope.id]).without(activeId);

                    delete $scope.list[$scope.id];
                    gridDataSrv.sav({key: 'members/friend'}, relationData);
                }
            },
            'friend'     : function($scope, $element) {
                $($element).find('.subButton').removeClass('subButton').addClass('addButton'); //JQ
                $scope.buttons = { save : false, sub : true, detail : false, del : true };

                $scope.$on('rowClicked', function (evt, scopeId) {
                    $scope.buttons.sub = !_($scope.relationData[$scope.id]).contains(scopeId);
                });

                $scope.clk =  function() { // click on the member list
                    $scope.$parent.activeRowScope = $scope;

                    var html = 
                        "<div grid key='members/" + $scope.id + "/friend'"
                            + " parent-data-fn='parentData(data)'  rel='friend'"
                            + " config='PaneConfig' child></div>";

                    $scope.$parent.after(html, $scope.$parent);

                    $scope.$parent.$broadcast('rowClicked', $scope.id);
                }

                $scope.subPane = function() { // add friend to member
                    var relationData = $scope.$parent.relationData;
                    var activeId     = $scope.activeRowScope.id;
                    
                    if (!_(relationData[activeId]).contains($scope.id)) {
                        function addRelation(activeId, scopeId) {
                            if ( _.isUndefined(relationData[activeId]) )
                                relationData[activeId] = [];
                            relationData[activeId].push(scopeId);
                        }

                        addRelation(activeId, $scope.id);
                        if (true && (activeId != $scope.id)) // mutual case
                            addRelation($scope.id, activeId);

                        gridDataSrv.sav({key: 'members/friend'}, relationData);
                        $scope.childGridScope.list[$scope.id] = [ $scope.row[0] ];

                        $scope.buttons.sub = false; 
                    }
                } 

                var defaultFn = $scope.del;
                $scope.del = function(cb) {
                    var relationData = $scope.relationData;
                    var related = relationData[$scope.id];

                    if ( !_.isUndefined(related) )
                        for (var i=0; related.length>i; i++) {
                            relationData[related[i]] = _(relationData[related[i]]).without($scope.id);
                            if (true) // for mutual case
                                relationData[$scope.id] = _(relationData[$scope.id]).without(related[i]);
                        }

                    gridDataSrv.sav({key: 'members/friend'}, _(relationData).omit($scope.id));
                    defaultFn();

                }
            },
            'controller' : function($scope) {
                $scope.meta     = $scope.$parent.meta.columns;
                $scope.metaType = 'tab';

                $scope.buttons = { save : false, sub : false, detail : true, del : true};

                function isDirty() { 
                    return $scope.buttons.save = $scope.dirty = !_($scope.row).isEqual($scope.workRow);
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
                   $scope.closeLastRow($scope);
                   $scope.chg();
                }

                $scope.defaultClk = function(idx) {
                } 

                $scope.clkz = function(idx) {
                    $scope.defaultClk(idx);
                }

                $scope.sav = function() {
                    $scope.$parent.sav($scope.workRow, $scope.id);
                    $scope.trClass = '';
                }

                $scope.del = function() {
                    $scope.$parent.del($scope.id);
                }

                $scope.subPane = function() {
                    $scope.$parent.subPane($scope, rowDataLabel());
                }

                $scope.detail = function() {
                    $scope.$parent.detail($scope, rowDataLabel());
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
