//
// Service Modules START
//
angular.module('app.gridConf', [])
    .factory('config', function() {
        return {
            'meta' : {
                'layout' : {
                    'columns' : [ 
                        'Name',
                        'Position',
                        'SomeRadio:2:R:Chicken,Turkey',
                        'Type:3:S:static/types',
                        'Active:4:C:Yes,No,Maybe'
                    ],
                    'data'    : this,
                    'children' : {
                                'minorities' : {
                                    'columns' : ['Name', 'Percentage', 'Language']
                                }
                    }
                },
                'management' : {
                    'columns' : [   'First Name', 
                                    'Last Name', 
                                    'Active:4:R:Yes,No', 
                                    'Member:6:C:New,Old', 
                                    'Description:3/:TA', 
                                    'Location:5/:S:static/location'],
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

            'tplUrls' : {
                'main'        : 'html/grid/main.html',
                'rowButtons'  : 'html/grid/rowButtons.html',
                'tdText'      : 'html/grid/tdText.html',
                'tdRadio'     : 'html/grid/tdRadio.html',
                'tdCheckbox'  : 'html/grid/tdCheckbox.html',
                'tdSelect'    : 'html/grid/tdSelect.html',
                'headButtons' : 'html/grid/headButtons.html',
                'tabRow'      : 'html/grid/tabRow.html',
                'cell'        : 'html/grid/cell.html'
            },

            getAllColumns:  function(key) { 
                return this.findMeta(key).columns;
            },

            getTabColumns:  function(key) { 
                var colNames = [], colsA = [], tabPos='';

                _(this.findMeta(key).columns).each( function(v,k) {
                    colsA = v.split(':');
                    if ( _.isUndefined(colsA[1]) || _.isUndefined(colsA[1].split('/')[1]) )
                        colNames.push(colsA[0]);
                });
                return colNames;
            },

            getChildren: function(key) {
                return _.isUndefined(m = this.findMeta(key)) ? false : m.children; 
            },

            getInputMeta: function(key, idx) {
                var meta = this.getMeta(key,true).columns[idx].split(':');
                var $return = {};

                switch (meta.length) {
                    case 4  : $return.labs = meta[3].split(',');
                    case 3  : $return.type = meta[2];
                    case 2  : $return.pos  = meta[1];
                    case 1  : $return.name = meta[0]; break;
                    default : $return = false;
                }
                return $return;
            },

            findMeta : function(key) {
                var keys = UT.gridKey(key).split('/');
                var meta = UT.doubleCopy(this.meta[keys.shift()]);

                for (var i=0 ; i<keys.length ; i++ )
                    meta = meta.children[keys[i]];

                return meta;
            },

            getMeta : function(key, allCols) {
                var meta = this.findMeta(key);

                if (_.isUndefined(meta))
                    return false;
                else {
                    meta.columns = _.isUndefined(allCols)   ? this.getTabColumns(key) 
                                                            : this.getAllColumns(key);
                    return meta;
                }
            }
        }
    })
;
