angular.module('app.services', ['app.gridConf'])
    .factory('gridDataSrv', function($http,config) {
        return  {
            prefix: 'GRID:',

            clear: function(key) { 
                _.isUndefined(key) ? localStorage.clear() : delete localStorage[key]; 
            },

            setParams : function(attrs, scope) {
                var $return = {key:attrs.key, columns:[], url:null};
                
                $return.columns = config.getTabColumns(attrs.key);
                $return.url     = _.isUndefined(attrs.url) ? config.getMeta(attrs.key).url 
                                                           : attrs.url;
                return _.isEmpty($return.columns) ? false : $return;
            },

            get: function(attrs, scope, cb) {
                function setLists(src){
                    scope.listW    = UT.doubleCopy( scope.list = src );
                    cb(scope.list);
                };

                var params = this.setParams(attrs, scope);

                if ( params.url )
                    $http.get(params.url).success( function(data) { 
                        setLists({data:data, meta:config.getMeta(params.key)});
                    });
                 else 
                    if ( _.isEmpty(localStorage[this.prefix + params.key]) )
                        setLists({meta:params, data:{}});
                    else {
                        if ( _.isUndefined(localStorage[this.prefix + params.key]) )
                            setLists({meta:params, data:{}});

                        setLists(JSON.parse(localStorage[this.prefix + params.key]));
                    }
            },

            sav: function(key, list, id) {
                localStorage[this.prefix + key] = JSON.stringify( list );
                return 'success';
            }
        }
    })
;
