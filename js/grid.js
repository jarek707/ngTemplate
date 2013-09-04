angular.module('app.directives', ['app.gridConf', 'app.directiveScopes'])
    .directive('pImg', ['config', function(config) {
        return {
            restrict    : 'A',
            replace     : true,
            transclude  : true,
            templateUrl : config.getTplUrl('pImg'),
            link        : function($scope, $element) { 
                if (!_.isUndefined($scope.meta.columns))
                    $scope.meta = $scope.meta.columns;
            },
            controller: function($scope, $element) {
                $scope.trClass = false;
            }
        }
    }])
    .directive('tdText', ['config', function(config) {
        return {
            restrict    : 'A',
            replace     : true,
            transclude  : true,
            templateUrl : config.getTplUrl('tdText'),
            link        : function($scope, $element) { 
                if (!_.isUndefined($scope.meta.columns))
                    $scope.meta = $scope.meta.columns;

                $scope.meta = $scope.meta['tab'][$scope.i]; 
                $scope.chg  = function() { $scope.$parent.chg($scope.meta.pos) };

                if ($scope.i == 0 && $scope.row[$scope.i] == '')
                    $($element.find('input')).focus();
            },
            controller: function($scope, $element) {
            }
        }
    }])
    .directive('tdRadio', ['config', function(config) {
        return {
            restrict    : 'EA',
            replace     : true,
            transclude  : true,
            templateUrl : config.getTplUrl('tdRadio'),
            link        : function($scope) { 
                if (!_.isUndefined($scope.meta.columns))
                    $scope.meta = $scope.meta.columns;

                $scope.meta = $scope.meta[$scope.metaType][$scope.i]; 
                $scope.chg  = function() { $scope.$parent.chg($scope.meta.pos) };
            }
        }
    }])
    .directive('tdCheckbox', ['config', function(config) {
        return {
            replace     : true,
            restrict    : 'EA',
            transclude  : true,
            templateUrl : config.getTplUrl('tdCheckbox'),
            link        : function($scope, $element) { // link function
                if (!_.isUndefined($scope.meta.columns))
                    $scope.meta = $scope.meta.columns;

                $scope.meta   = $scope.meta[$scope.metaType][$scope.i];

                if ( typeof $scope.workRow[$scope.meta.pos] != 'object' ) {
                    $scope.workRow[$scope.meta.pos] = UT.mkEmpty($scope.meta.labs, false);
                    $scope.row[$scope.meta.pos]     = UT.mkEmpty($scope.meta.labs, false);
                }

                $scope.chg = function() { $scope.$parent.chg($scope.meta.pos); };
            }
        }
    }])
    .directive('tdSelect', ['config', function(config) {
        return {
            replace     : true,
            restrict    : 'EA',
            scope       : true, 
            transclude  : true,
            templateUrl : config.getTplUrl('tdSelect'),
            link    : function($scope, $element) {
                $scope.meta = $scope.meta[$scope.metaType][$scope.i];
                $scope.chg  = function() { $scope.$parent.chg($scope.meta.pos); };
            }
        }
    }])
    .directive('rowButtons', ['config', 'controllers', 'linkers',
        function(config, controllers, linkers) {
            return {
                replace     : false,
                restrict    : 'EA',
                templateUrl : config.getTplUrl('rowButtons'),
                link        : function($scope, $element) { 
                    linkers.set('row', $scope, $element); 
                },
                controller  : function($scope, $element) { controllers.set('row', $scope, $element); }
            }
        }
    ])
    .directive('loopContent', ['$compile', 'config',
        function($compile, config) {
            return {
                replace     : true,
                restrict    : 'EA',
                template    : '',
                templateUrl : config.getTplUrl('loopContent')
            }
        }
    ])
    .directive('gridHead', ['config', 'controllers', 'linkers', '$compile',
        function(config, controllers, linkers, $compile) {
            return {
                replace  : false,
                restrict : 'A',
                link        : function($scope, $element, $attrs) {
                    config.getTpl('gridHead', $scope.meta.tplDir, function(tpl) { 
                        $element.append($compile(tpl)($scope));
                    });
                    
                    ($scope.spaces = UT.gridKey($scope.$attrs.key).split('/')).pop();
                },
                controller  : function($scope) { controllers.head['default']($scope); }
            }
        }
    ])
    .directive('grid', ['$compile',  'config', 'controllers','linkers',
        function ($compile, config, controllers, linkers) {
            return {
                replace     : false,
                restrict    : 'AE',
                scope       : { expose : '&', parentList : '='},
                transclude  : false,
                template    : "",
                compile     : function(el, attrs, trans) {
                    var params   = el.find('params').remove();
                    var matches = $(el).html().match(/<!--.*?ITERATE([\s\S]*?)-->/);
                    var iterate = matches ? matches[1] : '';
                    var children = el.html().replace(/<!--.*?ITERATE[\s\S]*?-->/ , '{{ITERATION}}')
                                            .replace(/<!--.*?ITERATE[\s\S]*?-->/g, '');
                    el.find('*').remove();
                    
                    return  function($scope, $element, $attrs) {
                        var metaParams = config.setParams($attrs, params); 
                        $scope.meta = _.extend(config.getMeta($scope.$attrs.key), metaParams); 

                        linkers.set('main', $scope, $element);

                        config.getTpl($scope.meta.grid, '', function(html) { 
                            if (html.indexOf('{{injectHtml}}') > -1)
                                html = html.replace('{{injectHtml}}', iterate);

                            if (children.indexOf('{{ITERATION}}') > -1)
                                html = children.replace('{{ITERATION}}',html); 

                            $element.append($compile(html)($scope));
                        });
                    }
                },
                controller  :  function($scope, $element, $attrs) {
                    $scope.exposing = function(dataItem) {
                        return $scope[dataItem];
                    };

                    $scope.$attrs = $attrs;
                    $scope.key   = $attrs.key;
                    controllers.set('main', $scope);
                }
            }
        }
    ])
    .directive('notify', function factory() {
        return {
            restrict   : 'C',
            replace    : true,
            scope      : true,
            controller : function($scope, $element) {

                $scope.$parent.notify = function(msgId, type, msg, howLong) {
                    if ( _.isUndefined(type)) type = 'info';
                    if ( _.isUndefined(msg))  msg  = '';

                    switch (msgId) {
                        case 'sav' : flash('Saving Row.'      + msg, type, howLong); break;
                        case 'rel' : flash('Reloading Table.' + msg, type, howLong); break;
                        case 'del' : flash('Deleting Row'     + msg, type, howLong); break;
                        default    : flash(                     msg, type, howLong); break;
                    }
                };

                function flash(msg, type, howLong) {
                    var colors = {"success":"green", "warn":"#a80", "error":"red", "info":"#888"};

                    if (_.isUndefined(howLong)) howLong = 1;

                    $element.html('<b><i>' + UT.camelize(type, true) + ':</i></b> ' + msg)
                            .css( {display:"block", color:colors[type]} );

                    setTimeout(function() {$element.css({display:"none"})}, 2000*howLong);
                };
            }
        }
    })
    .directive('box', function factory() {
        return {
            restrict:   'EA',
            template:   '<div class="box">text in a box</div>',
            transclude: true,
            replace:    true
        }
        
    })
    .filter('last', function() {
        return function(input, delim) {
            return input.split(_.isUndefined(delim) ? '/' : delim).pop();
        }
    })
    .filter('Last', function() {
        return function(input, delim) {
            var last = input.split(_.isUndefined(delim) ? '/' : delim).pop();
            return last.charAt(0).toUpperCase() + last.substr(1);
        }
    })
    .filter('colName', function() {
        return function(input, delim) {
            return input.split(_.isUndefined(delim) ? ':' : delim).shift();
        }
    })
    .filter('toLabel', function() {
        return function(input, labels, type) {
            if ( typeof labels == 'undefined' ) return 'no labels';

            if (_.isUndefined(input) || input === '') {
                return '--none--';
            } else {
                var $return = '';
                switch (type) {
                    case 'chk' :
                        _.some(input) 
                            ?  _(input).each(function(v,k) { $return += v ? ',' + labels[k] : ''; })
                            : $return = ' --none--';
                        $return = $return.substr(1);
                        break;
                    case 'sel' : 
                        _(labels).each( function(v,k) { 
                            if ( v.id == input ) {
                                $return = v.val;
                            }
                        }) 
                        break;
                    default    : $return = labels[input];     break;
                }

                return $return;
            }
        }
    })
;
//  Directives END

angular.module('app', ['app.services', 'app.directives', 'app.customDirectives']);
