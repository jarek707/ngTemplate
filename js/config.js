//
// Service Modules START
//
angular.module('app.gridConf', ['app.directives'])
    .service('config', function($http) {
        this.tplDir = 'html/grid/';
        var _this = this;
        function setTplDir(arg) {
            _this.tplDir = 'html/grid/' + (arg ? arg + '/' : '');
        }

        var selects = {};
        $http.get('data/selects').success(function(data) { selects = data; });

        return {
            'tplUrls' : {
                'main'        : 'main.html',
                'mainDiv'     : 'mainDiv.html',
                'mainNoHead'  : 'mainNoHead.html',
                'mainNoButtons': 'mainNoButtons.html',
                'singleLoop'  : 'singleLoop.html',
                'gridHead'    : 'gridHead.html',
                'loopContent' : 'loopContent.html',
                'rowButtons'  : 'rowButtons.html',
                'tdSelect'    : 'tdSelect.html',
                'tdText'      : 'tdText.html',
                'tdRadio'     : 'tdRadio.html',
                'tdCheckbox'  : 'tdCheckbox.html',

                'sub'         : 'sub.html',
                'subText'     : 'subText.html',
                'subCheckbox' : 'subCheckbox.html',
                'subSelect'   : 'subSelect.html',
                'pImg'        : 'pImg.html',
                'subRadio'    : 'subRadio.html'
            },

            setParams : function(attrs, params) {
                var $ret  = _.isEmpty(params) ? {}
                          : {
                                'config'         : params.attr('config') || false,
                                'tplDir'         : params.attr('tpl-dir') || false,
                                'grid'           : params.attr('grid') || false,
                                'childContainer' : params.attr('child-container') || false,
                                'rel'            : params.attr('rel') || false,
                                'key'            : params.attr('key') || false,
                                'child'          : !_.isUndefined(params.attr('child')),
                                'autoClose'      : !_.isUndefined(params.attr('auto-close'))
                            };

                // attributes override params
                function setDefault(arg, defaultVal) {
                    if (_.isUndefined(attrs[arg]) ||  _.isEmpty(attrs[arg]))
                        $ret[arg] = _.isEmpty($ret[arg]) ? defaultVal : $ret[arg];
                    else 
                        $ret[arg] = _.isEmpty(attrs[arg]) ? defaultVal : attrs[arg];
                }

                setDefault('config',         'PaneConfig');
                setDefault('tplDir',         '');
                setDefault('grid',           'main');
                setDefault('childContainer', false);
                setDefault('rel',            '');
                setDefault('key',            false);

                $ret.child     = $ret['child']      || !_.isUndefined(attrs['child']);
                $ret.autoClose = $ret['auto-close'] || !_.isUndefined(attrs['auto-close']);

                setTplDir($ret.tplDir);
                this.setConfigObject($ret.config);

                return $ret;
            },

            getTplUrl : function(tplName) {
                $ret = _this.tplDir + this.tplUrls[tplName];
                return $ret;
            },

            getTpl : function(tplName, tplDir, cb) {
                setTplDir(tplDir);
                var tplUrl = this.getTplUrl(tplName);

                if (_.isUndefined(tplUrl))  cb('');
                else                        $http.get(this.getTplUrl(tplName)).success(cb);
            },

            setConfigObject : function(configObjectName) {
                try {
                    var configObject = eval(configObjectName);
                } catch (err) {
                    return false;
                }
                return this.configObject = configObject;
            },

            findMeta : function(key) {
                var keys = UT.gridKey(key).split('/');
                var meta = angular.copy(this.configObject[keys.shift()]);

                for (var i=0 ; i<keys.length ; i++ )
                    meta = meta.children[keys[i]];

                return meta;
            },

            getAllColumns:  function(meta) { 
                var $return = [], tab = [], cols = [], line = {}, count = 0, undefCount = 0;
                var posMap = {};

                _(meta.columns).each( function(v,k) {
                    cols = v.split(':');
                    line = {};
                    if (_.isUndefined(cols[1]) || cols[1].substr(0,1) != '-') {
                        switch (cols.length) {
                            case 4  : line.labs = cols[3].split(',');
                            case 3  : line.type = cols[2];
                            case 2  : line.pos  = cols[1];
                            case 1  : line.name = cols[0]; break;
                            default : line = {};
                        }
                        if (_.isUndefined(line.type)) line.type = 'T';
                        if (line.type == 'S' && !_.isUndefined(selects[line.labs]))
                            line.labs = selects[line.labs];

                        if   (_.isUndefined(line.pos)) {
                            posMap[k] = undefCount;
                            count = 100 + undefCount++;
                        } else {
                            count = parseInt(isNaN(line.pos.substr(0,1))    ? line.pos.substr(1) 
                                                                            : line.pos) + 200;
                            posMap[k] = count - 200;
                        }

                        if (_.isUndefined(line.pos) || line.pos.substr(0,1) != '+') {
                            line.pos = k.toString();
                            tab.push(_.clone(line));
                        }

                        line.pos = k.toString();
                        $return[count] = angular.copy(line);
                    }
                });
                
                return {tab:tab, all:_($return).filter(function() { return true; }) };
            },

            getTabColumns:  function(meta) { 
                var $return = [], cols = [];

                _(meta.columns).each( function(v,k) {
                    cols = v.split(':');
                    if (_.isUndefined(cols[1]) || (cols[1].substr(0,1) != '-' && cols[1].substr(0,1) != '+')) 
                        $return.push(cols[0]);
                });
                return $return;
            },

            getMeta : function(key) {
                var meta = this.findMeta(key);

                if (_.isUndefined(meta)) return false;

                meta.columns = this.getAllColumns(meta);

                // Defaults START
                if (_.isUndefined(meta.autoHide))  meta.autoHide  = true;   
                if (_.isUndefined(meta.headHide))  meta.headHide  = false;
                if (_.isUndefined(meta.singleRow)) meta.singleRow = false;
                if (_.isUndefined(meta.autoAdd)  ) meta.autoAdd   = false;
                // Defaults END

                return meta;
            },

            getChildren: function(key) {
                return _.isUndefined(m = this.findMeta(key)) ? false : m.children; 
            }
        }
    })
;
