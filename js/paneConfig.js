PaneConfig  = {
    'members' : {
        'columns' : ["First"],
        'rel'     : 'friend',
        'relName' : 'friends'
    },
    'layout' : {
        'autoHide' : false,
        'columns' : [ 
            'Name',
            'Position',
            'SomeRadio:3:R:Chicken,Turkey',
            'Type:4:S:static/types',
            'AlergicTo:5:C:Fish,Bread,Food'
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
}
