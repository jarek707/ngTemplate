//
// Service Modules START
//
angular.module('app.gridConf', [])
    .factory('config', function() {
        return {
            'tplUrls' : {
                'main'        : 'html/grid/main.html',
                'headButtons' : 'html/grid/headButtons.html',
                'rowButtons'  : 'html/grid/rowButtons.html',
                'tdSelect'    : 'html/grid/tdSelect.html',
                'tdText'      : 'html/grid/tdText.html',
                'tdRadio'     : 'html/grid/tdRadio.html',
                'tdCheckbox'  : 'html/grid/tdCheckbox.html',

                'sub'         : 'html/grid/sub.html',
                'subText'     : 'html/grid/subText.html'
            },

            'meta' : {
                'members' : {
                    'columns' : ["First"],
                    'rel'     : 'friend',
                    'relName' : 'friends'
                },
                'layout' : {
                    'autoHide' : true,
                    'columns' : [ 
                        'Name',
                        'Position',
                        'SomeRadio:2:R:Chicken,Turkey',
                        'Type:3:S:static/types',
                        'Active:4:C:Yes,No,Maybe'
                    ],
                    'children' : {
                        'editable' : {
                            'autoHide' : true,
                            'columns' : ['Name', 'Dom Id'],
                            'children' : {
                                'static' : {
                                    'columns' : ['Name', 'Offset', 'Active:1:R:Y,N']
                                }
                            }
                        }
                    }
                },
                'management' : {
                    'columns' : [   'First Name', 
                                    'Last Name', 
                                    'Active:4:R:Yes,No', 
                                    'Member:6:C:New,Old', 
                                    'Description:3:TA', 
                                    'Location:2:S:data/selects',
                                    'Aux:+5:T',
                                    'parentId:-'
                                    ],
                    'children' : {
                        'population' : {
                            'columns' : ['Type', 'Percentage', 'Language'],
                            'children' : {
                                'minorities' : {
                                    'columns' : ['Name', 'Percentage', 'Language']
                                }
                            }
                        }
                    }

                },
                'continent'  : {
                    'url'      : 'data/cluster.php',
                    'columns'  : ['Name', '# of Countries' , 'Population', 'Image:3/'],
                    'children' : {
                        'country' : {
                            'columns' : ['Name', 'Area','Population', 'Active:3:R:Yes:No'],
                            'children' : {
                                'region' : {
                                    'columns' : ['Designation:M', 'Timezone:M', 'Size:M', 'Population:M'],
                                    'children' : {
                                        'town' : {
                                            'columns' : ['Name:M', 'Size:M', 'Population:M'],
                                            'children' : {
                                                'hood' : {
                                                    'columns' : ['Name:M', 'Size:M', 'Population:M', 'Number of Units:M'],
                                                    'children' : {
                                                        'address' : {
                                                            'columns' : ['Street:M', 'Number:M', 'Apt. Number:M', 'Room Number:M']
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'statistics' : {
                            'columns' : ['Type','Range'], 
                            'children' : {
                                'population' : {
                                    'columns' : ['Type', 'Percentage', 'Language'],
                                    'children' : {
                                        'minorities' : {
                                            'columns' : ['Name', 'Percentage', 'Language']
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'managers' : {
                    'columns' : ['First', 'Last' , 'Email', 'Phone'],
                    'children': {
                        'division' : {
                            'columns' : ['Address', 'Phone', 'Branch'],
                            'children': {
                                'office' : {
                                    'columns' : ['Address', 'Phone', 'Contact Name']
                                }
                            }
                        },
                        'field' : {
                            'columns' : ['Location', 'Cell', 'Region']
                        }
                    }
                },
                'localstuff' : {
                    'columns' : ['First', 'Last' , 'Local']
                }
            },

            findMeta : function(key) {
                var keys = UT.gridKey(key).split('/');
                var meta = UT.doubleCopy(this.meta[keys.shift()]);

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
