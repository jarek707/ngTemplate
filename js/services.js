//angular.module('app.relations', ['app.gridConf', 'app.services'])
angular.module('app.relations', ['app.gridConf'])
    .factory('rel', function($http,config, $compile) {
        return  {
            'use' : function(relKey, fnName, cb, args) {
            LG( ' in use ');
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

                    var id = memberScope.id;
                    var data = memberScope.relationData[id];
                    if ( !_.isUndefined(data) )
                        for( var i = 0;  data.length>i; i++ ) {
                            if ( _.isUndefined( $return[data[i]] )) $return[data[i]] = [];
                            $return[data[i]].push(memberScope.list[data[i]][0]);
                        }

                    return $return;
                },
                'init' : function(scope, element, attrs) {
                    if (!_.isUndefined(scope.$attrs.child) ) {
                        scope.$parent.childGridScope = scope;
                        scope.list = this.mkList(scope.$parent.activeRowScope);

                        scope.id = scope.$attrs.key.split('/')[1];
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
