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
angular.module('app.services', ['app.gridConf', 'app.relations'])
    .factory('gridDataSrv', function($http, config, rel) {
        return  {
            prefix: 'GRID:',

            parentKey : function(attrs) {
                var sp = attrs.key.split('/');
                sp.pop();
                sp.pop();
                
                var $return = _.clone(attrs);
                $return.key = sp.join('/');
                return $return;
            }, 

            clear: function(key) { 
                _.isUndefined(key) ? localStorage.clear() : delete localStorage[key]; 
            },

            sav: function(attrs, list) {
                switch (config.findMeta(attrs.key).rel) {
                    case 'friendz' :
                        localStorage[this.prefix + attrs.key] = 
                            JSON.stringify(rel.friend.set(this.getData(this.parentKey(attrs)), list));
                        break;
                    default :
                        localStorage[this.prefix + attrs.key] = JSON.stringify(list);
                        break;
                }
                return 'success';
            },

            get: function(attrs, scope) {
                scope.listW = angular.copy(scope.list = this.getData(attrs.key));
            },

            getData: function(key) {
                if (!_.isUndefined(config.findMeta(key).url)) {
                    $http.get(config.findMeta(key).url).success( function(data) { 
                        return data; 
                    });
                 } else {
                    var localData = localStorage[this.prefix + key];
                    if (_.isUndefined(localData) || _.isEmpty(localData))
                        return {};
                    else 
                        return JSON.parse(localData);
                }
            }
        }
    })
;
