//
// Service Modules START
//
angular.module('app.gridConf', [])
    .factory('config', function() {
        var tplDir = 'html/grid/';

        return {
            'tplUrls' : {
                'main'        : tplDir + 'main.html',
                'headButtons' : tplDir + 'headButtons.html',
                'rowButtons'  : tplDir + 'rowButtons.html',
                'tdSelect'    : tplDir + 'tdSelect.html',
                'tdText'      : tplDir + 'tdText.html',
                'tdRadio'     : tplDir + 'tdRadio.html',
                'tdCheckbox'  : tplDir + 'tdCheckbox.html',

                'sub'         : tplDir + 'sub.html',
                'subText'     : tplDir + 'subText.html'
            },

            setConfigObject : function( configObjectName ) {
                try {
                    var configObject = eval(configObjectName);
                } catch (err) {
                    return false;
                }
                return this.configObject = configObject;
            },

            findMeta : function(key) {
                var keys = UT.gridKey(key).split('/');
                var meta = UT.doubleCopy(this.configObject[keys.shift()]);

                for (var i=0 ; i<keys.length ; i++ )
                    meta = meta.children[keys[i]];

                return meta;
            },

            getAllColumns:  function(meta) { 
                var $return = {}, cols = [], line = {}, count = 0, undefCount = 100;

                _(meta.columns).each( function(v,k) {
                    cols = v.split(':');
                    if (_.isUndefined(cols[1]) || cols[1].substr(0,1) != '-') {
                        switch (cols.length) {
                            case 4  : line.labs = cols[3].split(',');
                            case 3  : line.type = cols[2];
                            case 2  : line.pos  = cols[1];
                            case 1  : line.name = cols[0]; break;
                            default : line = {};
                        }
                        if (_.isUndefined(line.type))  // Default to Text field
                            line.type = 'T';

                        if (_.isUndefined(line.pos)) {
                            count = undefCount++;
                        } else {
                            count = parseInt(   
                                isNaN(line.pos.substr(0,1)) ? line.pos.substr(1) : line.pos
                            ) + 200;
                        }

                        $return[count] = angular.copy(line);
                    }
                });
                
                return _($return).filter( function() { return true; } );
            },

            getTabColumns:  function(meta) { 
                var colNames = [], cols = [];

                _(meta.columns).each( function(v,k) {
                    cols = v.split(':');
                    if (_.isUndefined(cols[1]) || (cols[1].substr(0,1) != '-' && cols[1].substr(0,1) != '+')) 
                        colNames.push(cols[0]);
                });
                return colNames;
            },

            getMeta : function(key) {
                var meta = this.findMeta(key);

                if (_.isUndefined(meta)) return false;

                meta.columns = {    tab : this.getTabColumns(meta),
                                    all : this.getAllColumns(meta) };

                // Defaults START
                if (_.isUndefined(meta.autoHide))  meta.autoHide  = true;   
                if (_.isUndefined(meta.headHide))  meta.headHide  = false;
                if (_.isUndefined(meta.singleRow)) meta.singleRow = false;
                // Defaults END

                return meta;
            },

            getInputMeta: function(key, idx) {
                var cols = this.getMeta(key).columns[idx].split(':');
                var $return = {};

                switch (cols.length) {
                    case 4  : $return.labs = cols[3].split(',');
                    case 3  : $return.type = cols[2] ;
                    case 2  : $return.pos  = cols[1];
                    case 1  : $return.name = cols[0]; break;
                    default : $return = false;
                }
                if (_.isUndefined($return.type)) $return.type = 'T';
                return $return;
            },

            getChildren: function(key) {
                return _.isUndefined(m = this.findMeta(key)) ? false : m.children; 
            }
        }
    })
;
