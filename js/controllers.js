angular.module('app.directiveScopes', ['app.gridConf'])
    .service('controllers', ['$http', 'config', '$compile', 'rel', 'gridDataSrv', 
        function($http, config, $compile, rel, gridDataSrv) {
            return {
                'row' : {
                    'set' : function($scope, $element) {
                        this.default($scope);
                        
                        if (!_.isUndefined($scope.$attrs.rel) && _.isFunction(this[$scope.$attrs.rel]))
                            if (_.isUndefined($scope.$attrs.child))
                                this[$scope.$attrs.rel]($scope, $element);
                            else
                                this[$scope.$attrs.rel + '_child']($scope, $element);
                    },
                    'friend_child' : function($scope, $element) {
                        $scope.buttons = { save : false, sub : false, detail : false, del : true };

                        $($element).find('.delButton').removeClass('delButton')
                                                      .addClass('removeButton'); //JQ

                        $scope.del = function(cb) {
                            var activeId     = $scope.parentDataFn({data: 'activeRowScope'}).id;
                            var relationData = $scope.parentDataFn({data: 'relationData'});
                            relationData[activeId] = _(relationData[activeId]).without($scope.id);
                            if (!_.isUndefined($scope.$parent.meta.mutual) )
                                relationData[$scope.id] = _(relationData[$scope.id]).without(activeId);

                            delete $scope.list[$scope.id];
                            gridDataSrv.sav({key: 'members/friend'}, relationData);

                            $scope.parentDataFn({data: 'activeRowScope'}).clk(true);
                        }

                        $scope.editRow = function() {} //disabled
                    },
                    'friend'     : function($scope, $element) {
                        $scope.buttons = { save : false, sub : false, detail : false, del : true };

                        $($element).find('.subButton').removeClass('subButton').addClass('addButton'); //JQ

                        $scope.$on('rowClicked', function (evt, scopeId) {
                            $scope.buttons.sub = !_($scope.relationData[$scope.id]).contains(scopeId);
                        });

                        $scope.clk =  function(force) { // click on the member list
                            if ( _.isUndefined(force) && $scope.lastRowScope && ($scope.lastRowScope.$id == $scope.$id )) return false;

                            $scope.$parent.activeRowScope = $scope;

                            var html = 
                                "<div grid='notable,nohead' key='members/" + $scope.id + "/friend'"
                                    + " parent-data-fn='parentData(data)'  rel='friend'"
                                    + " config='PaneConfig' child></div>";

                            $scope.after(html, $scope.$parent);

                            $scope.$parent.$broadcast('rowClicked', $scope.id);
                            if ($scope.lastRowScope) 
                                $scope.lastRowScope.blr();

                            $scope.closeLastRow($scope);
                            $scope.sel();
                        }
                         
                        $scope.after = function(html, rowScope) {
                            $($element.parent().parent().parent()).find('.friend_child').remove();

                            var compiled = $compile('<li class="row friend_child">' + html +'</li>')(rowScope);
                            $element.parent().parent().after( compiled );
                        }

                        $scope.subPane = function() { // add friend to member
                            if ( $scope.lastRowScope ) {
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
                                    $scope.childGridScope.list[$scope.id] = [ $scope.row.join(', ') ];

                                    $scope.buttons.sub = false; 
                                }
                            }
                        } 

                        var defaultFn = $scope.del;
                        $scope.del = function() {
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
                    'default' : function($scope) {
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

                        $scope.getElementClass = function(i) {
                            return $scope.meta.tab[i].type == 'T' ? '' : 'notext';
                        }

                        $scope.chg = function() {
                            $scope.trClass = 'editable' + (isDirty() ? ' dirty' : '');   
                        }

                        $scope.sel = function() {
                            $scope.trClass = 'selected' + (isDirty() ? ' dirty' : '');   
                        }

                        $scope.blr = function() { 
                            $scope.trClass = $scope.trClass.replace('editable','');
                            $scope.trClass = $scope.trClass.replace('selected','');
                        }
                        
                        // Relation functions START
                        var relName = $scope.$parent.meta.rel;

                        $scope.editRow = function() { // Usually on ng-Dblclick
                           $scope.closeLastRow($scope);
                           $scope.chg();
                        }

                        $scope.defaultClk = function(idx) {
                        } 

                        $scope.clk = function(idx) {
                            $scope.defaultClk(idx);
                        }

                        $scope.save = function() {
                            LG( 'saving ');
                            $scope.$parent.save($scope.workRow, $scope.id);
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
            }
        }
    ])
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
