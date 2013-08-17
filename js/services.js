angular.module('app.relations', ['app.gridConf'])
    .factory('rel', function($http,config) {
        return  {
            'use'    : function(relKey, fnName, cb) {
                    var relObj = this[relKey];

                    if (!_.isUndefined(relObj) && _.isFunction(relObj[fnName])) 
                        relObj[fnName]();
                    else 
                        cb();
            },
            'friend' : {
                'init' : function(scope, element) {
                },
                'get' : function(pData, cData) {
                    _(pData.data).each( function(v,k) {
                    });
                    _(cData.data).each( function(v,k) {
                    });
                    return cData;
                },
                'set' : function(pData, cData) {
                    var data = '';
                    _(cData.data).each( function(v,k) {
                    });
                    _(pData.data).each( function(v,k) {
                        data += ',' + k;
                    });
                    return cData; 
                },
                'exp' :function(list) {
                        //element.find('table').after( '<gridChild><grid key="friend" /></gridChild>');
                }
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

            setParams : function(attrs) {
                var $return = {key:attrs.key, columns:[], url:null};
                
                $return.columns = config.getTabColumns(attrs.key);
                $return.url     = _.isUndefined(attrs.url) ? config.getMeta(attrs.key).url 
                                                           : attrs.url;
                $return.rel     = config.getMeta(attrs.key).rel;
                return _.isEmpty($return.columns) ? false : $return;
            },

            sav: function(attrs, list, id) {
                var params = this.setParams(attrs);
                switch (params.rel) {
                    case 'friends' :
                        localStorage[this.prefix + attrs.key] = 
                            JSON.stringify(rel.friend.set(this.getData(this.parentKey(attrs)), list));
                        break;
                    default :
                        localStorage[this.prefix + attrs.key] = JSON.stringify( list );
                        break;
                }
                return 'success';
            },

            get: function(attrs, scope, cb ) {
console.log('in get');
                var params = this.setParams(attrs);
                var $return = null;

                switch (params.rel ) {
                    case 'friends' : 
                        var cData = this.getData(attrs);
                        var pData = this.getData(this.parentKey(attrs));
                        $return = rel.friend.get(pData, cData);
                        break;
                    default: 
                        $return = this.getData(attrs);
                        break;
                }

                scope.listW = UT.doubleCopy( scope.list = $return );
            },

            getData: function(attrs) {
                var params = this.setParams(attrs);

                if ( params.url )
                    $http.get(params.url).success( function(data) { 
                        return data;
                    });
                 else 
                    if ( _.isEmpty(localStorage[this.prefix + params.key]) )
                        return {};
                    else {
                        if ( _.isUndefined(localStorage[this.prefix + params.key]) )
                            return {};

                        return JSON.parse(localStorage[this.prefix + params.key]);
                    }
            }
        }
    })
;
