angular.module('app.directiveScopes', ['app.gridConf'])
    /*
     *
     *          LINKERS
     *
    */
    .service('linkers', ['$http', 'config', '$compile', 'gridDataSrv', 
        function($http, config, $compile, gridDataSrv) {
            return {
                'set' : function(type, $scope, $element) {
                    this[type]['default']($scope, $element);
                    
                    if (!_.isUndefined($scope.$attrs.rel) && _.isFunction(this[type][$scope.$attrs.rel])) {
                        if (_.isUndefined($scope.$attrs.child)) {
                            this[type][$scope.$attrs.rel]($scope, $element);
                        } else {
                            this[type][$scope.$attrs.rel + '_child']($scope, $element);
                        }
                    }
                },
                'head' :  {
                    'default' : function(el, attrs) {
                    }
                },
                'row' : {
                    'friend_child' : function($scope, $element) {
                        $scope.buttons = { save : false, sub : false, detail : false, del : true };

                        $($element).find('.delButton').removeClass('delButton')
                                                      .addClass('removeButton'); //JQ
                    },
                    'friend' : function($scope, $element) {
                        $scope.buttons = { save : false, sub : false, detail : false, del : true };

                        $($element).find('.subButton').removeClass('subButton').addClass('addButton'); //JQ

                        $scope.buttons.sub = false;
                    },
                    'default' : function($scope) {
                        if (_.some($scope.row)) {
                            $scope.buttons.sub = config.getChildren($scope.$parent.meta.key);
                            $scope.trClass = false; 
                        } else {
                            $scope.trClass = 'editable'; 
                            $scope.buttons.sub = false;
                        }

                        // Setup a shadow data row to keep local changes for comparisons and saving
                        $scope.workRow = angular.copy($scope.row);
                    }
                }, 

                // Main grid scope
                'main' : {
                    'friend_child' : function($scope) {
                        function mkList(memberScope) {
                            var $return = {};
                            var data    = memberScope.relationData[memberScope.id];

                            for (var i in data) {
                                if (_.isUndefined($return[data[i]])) 
                                    $return[data[i]] = [];

                                $return[data[i]] = memberScope.list[data[i]];
                            }
                            return $return;
                        }

                        $scope.$parent.childGridScope = $scope;
                        $scope.id   = $scope.meta.key.split('/')[1];

                        $scope.list = mkList($scope.$parent.lastRowScope);
                    },
                    'friend' : function($scope) {
                        $scope.relationData = gridDataSrv.getData('members/friend');
                    },
                    'default' : function($scope) {
                        $scope.lastRowScope         = null;
                        $scope.childGridScope       = null;
                        $scope.ngRepeatColumnLimit  = $scope.meta.columns.tab.length;

                        gridDataSrv.get($scope.meta, $scope);
                    }
                }
            }
        }
    ])
    /*
     *
     *          CONTROLLERS
     *
    */
    .service('controllers', ['$http', 'config', '$compile', 'gridDataSrv', 
        function($http, config, $compile, gridDataSrv) {
            return {
                'set' : function(type, $scope, $element) {
                    this[type]['default']($scope, $element);
                    
                    if (!_.isUndefined($scope.$attrs.rel) && _.isFunction(this[type][$scope.$attrs.rel]))
                        if (_.isUndefined($scope.$attrs.child))
                            this[type][$scope.$attrs.rel]($scope, $element);
                        else
                            this[type][$scope.$attrs.rel + '_child']($scope, $element);
                },
                'head' :  {
                    'default' : function($scope) {
                        $scope.peekTable = function() {
                            $scope.tableHide = $scope.tableHide ? false : 'hidden';
                        }

                        $scope.reload = function() { 
                            $scope.list  = UT.dobuleCopy($scope.list, $scope.listW);
                            $scope.notify('rel', 'success', _.isEmpty($scope.list) ? ' (empty)' : '');
                            if ($scope.tableHide) $scope.toggleTable();
                        }
                    }
                },
                'row' : {
                    'friend_child' : function($scope) {
                        $scope.del = function(cb) {
                            var activeId     = $scope.expose({data: 'lastRowScope'}).id;
                            var relationData = $scope.expose({data: 'relationData'});
                            relationData[activeId] = _(relationData[activeId]).without($scope.id);
                            if (!_.isUndefined($scope.$parent.meta.mutual) )
                                relationData[$scope.id] = _(relationData[$scope.id]).without(activeId);

                            delete $scope.list[$scope.id];
                            gridDataSrv.sav({key: 'members/friend'}, relationData);

                            $scope.expose({data: 'lastRowScope'}).rowClicked();
                        }

                        $scope.editRow = function() {} //disabled
                    },
                    'friend'     : function($scope, $element) {
                        $scope.$on('rowClicked', function (evt, scopeId) {
                            $scope.buttons.sub = !_($scope.relationData[$scope.id]).contains(scopeId);
                        });

                        // Child grid will call this when deleting friends from its list
                        $scope.rowClicked = function() {
                            $scope.$parent.$broadcast('rowClicked', $scope.id);
                        }

                        //
                        $scope.clk =  function(force) { // click on the member list
                            // Execute only if row has changed
                            if ($scope.closeLastRow($scope)) {
                                var html = 
                                    "<div grid='singleLoop' key='members/" + $scope.id + "/friend'"
                                        + " expose='exposing(data)' rel='friend' child" 
                                        + " parent-list='list' >"
                                        + " <!--ITERATE<div p-img>--></div>";

                                $scope.after(html, $scope.$parent);
                                $scope.sel();
                                $scope.rowClicked();
                            }
                        }
                         
                        //
                        $scope.after = function(html, rowScope) {
                            var parentMeta = $scope.$parent.meta;

                            if (!parentMeta.autoClose)
                                if (parentMeta.childContainer) 
                                    $(parentMeta.childContainer).find('*').remove();
                                else 
                                    $($element.parent().parent().parent()).find('.friend_child').remove();
                                    

                            var compiled = $compile('<li class="row friend_child">' + html +'</li>')(rowScope);
                            if (parentMeta.childContainer)
                                $(parentMeta.childContainer).append($compile(html)(rowScope));
                            else
                                $element.parent().parent().after( compiled );
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
                            delete $scope.childGridScope.list[$scope.id];
                            defaultFn();
                        }

                        //
                        $scope.subPane = function() { // add friend to member
                            if ( $scope.lastRowScope ) {
                                var relationData = $scope.$parent.relationData;
                                var activeId     = $scope.lastRowScope.id;
                                
                                // Update relations table
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

                                    // Update child list
                                    var rowContent = '';
                                    for (var i = 0 ; i < $scope.row.length; i++) {
                                        if ($scope.row[i] != '')
                                            rowContent += ', ' + $scope.row[i];
                                    }
                                    //$scope.childGridScope.list[$scope.id] = [ rowContent.substr(2) ];
                                    $scope.childGridScope.list[$scope.id] = $scope.row;

                                    $scope.buttons.sub = false; 
                                }
                            }
                        } 
                    },
                    'default' : function($scope, $element) {
                        if ( !_.isUndefined($scope.$parent.meta) )
                            $scope.meta = $scope.$parent.meta.columns;

                        $scope.metaType = 'tab';
                        $scope.trClass  = '';

                        $scope.buttons = { save : false, sub : false, detail : true, del : true};

                        function isDirty() { 
                            return $scope.buttons.save = $scope.dirty = !_($scope.row).isEqual($scope.workRow);
                        };

                        function rowDataLabel() { 
                            return UT.join(_($scope.workRow).filter( function(v,k) {
                                if (!_.isUndefined($scope.meta.tab[k]))
                                    return $scope.meta.tab[k].type == 'T' ? v : false;
                            }))
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
                            if ( $scope.trClass )
                                $scope.trClass = $scope.trClass.replace('editable','')
                                                               .replace('selected','');
                            else
                                $scope.trClss = '';
                        }
                        
                        $scope.editRow = function() { // Usually on ng-Dblclick
                           $scope.closeLastRow($scope);
                           $scope.chg();
                        }

                        $scope.defaultClk = function(idx) {
                        } 

                        $scope.clk = function(idx) {
                            if ($scope.closeLastRow($scope))
                                $scope.sel();
                        }

                        $scope.save = function() {
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
                    }
                },
                'main' : {
                    'friend_child' : function($scope, $element) {
                    },
                    'friend' : function($scope, $element) {
                        var parentAdd = $scope.add;
                        $scope.add = function() {
                            parentAdd();
                        }
                    },
                    'default' : function($scope, $element) {
                        $scope.restore = function() {
                            $element.find('grid').remove();
                            $scope.tableHide = false;
                            return $scope.rowContent = '';
                        }

                        // Turns off selected/edittable in the last row, stores currently clicked row
                        // Returns : true  - different row was clicked
                        //           false - same row was clicked (or double clicked)
                        $scope.closeLastRow = function(rowScope) {
                            var $return = true;

                            if ($scope.lastRowScope === false) { //New row was added
                                $return = false;
                            } else {
                                if ($scope.lastRowScope !== null) { // Not the first row click
                                    if ($scope.lastRowScope.$id != rowScope.$id) {
                                        $scope.lastRowScope.blr();
                                    } else {
                                        $return = false;
                                    }
                                }
                            }
                            $scope.lastRowScope = rowScope;
                            return $return;
                        }

                        // Row data methods BEGIN

                        $scope.save = function(row, id) {
                            $scope.list[id] = _.clone(row);
                            $scope.notify('sav', gridDataSrv.sav($scope.$attrs, $scope.list, id));

                            if ($scope.meta.autoAdd) { //autoAdd
                                $scope.add();
                            }
                        };

                        $scope.del = function(id)  { 
                            var firstField = $scope.list[id].shift();
                            delete $scope.list[id];
                            $scope.notify(  'del', 
                                            gridDataSrv.sav($scope.$attrs, $scope.list), 
                                            ' <b>"' + firstField + '"</b>'
                                         );
                        };

                        $scope.add = function() {
                            var newIdx = UT.minIntKey($scope.list, -1);

                            $scope.list[newIdx]  = UT.mkEmpty($scope.meta.columns.all, '');
                            $scope.listW[newIdx] = UT.mkEmpty($scope.meta.columns.all, '');

                            $scope.closeLastRow(false);
                            $scope.tableHide = false;
                        }
                        // Row data methods END

                        // Sub panes BEGIN
                        $scope.openSub = function(rowData) {
                            $scope.tableHide  = $scope.meta.autoHide;
                            $scope.rowContent = '{' + rowData + '}';
                        };

                        $scope.subPane = function(rowScope, workRow) {
                            _(config.getChildren($scope.meta.key)).each( function(v, childKey) { 
                                $scope.after(
                                    '<div grid key="' + $scope.meta.key + '/' + rowScope.id + '/' + childKey + '" '
                                    + 'expose="exposing(data)" parentList="list" ></div>', rowScope
                                );
                            });
                            $scope.openSub(workRow);
                        };

                        $scope.detail = function(rowScope, rowText) {
                            $scope.closeLastRow(rowScope);
                            $scope.after(
                                '<div detail key="' + $scope.meta.key + '/' + rowScope.id + '/"></div>', rowScope
                            );
                            $scope.openSub(rowText);
                        };
                        
                        // Append child pane after the table
                        $scope.after = function(html, rowScope) {
                            // IE8 needs this
                            if ( $element.find('table').parent().children().length > 2) 
                                delete $element.find('table').next().remove();

                            var compiled = $compile(html)(rowScope);
                            $element.find('table').after( compiled );
                        }
                        // Sub panes END
                    }
                }
            }
        }
    ])
;
