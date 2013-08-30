angular.module('app.services', ['app.gridConf'])
    .factory('gridDataSrv', function($http, config) {
        return  {
            prefix: 'GRID:',

            parentKey : function(attrs) {
                var sp = attrs.key.split('/');
                sp.pop();
                sp.pop();
                
                var $return = _.clone(attrs);
                $return.key = UT.joins(sp, '/');
                return $return;
            }, 

            clear: function() { 
                var keys = '';

                for (var i in localStorage) 
                    if (i.substr(0,5) == this.prefix) 
                        keys += i.substr(5) + '\n';

                var key = prompt('Enter key from the list:\n\n' + keys );
                _.isEmpty(key) ? localStorage.clear() : delete localStorage[this.prefix + key]; 
            },

            sav: function(attrs, list) {
                switch (config.findMeta(attrs.key).rel) {
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
