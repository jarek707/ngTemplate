<h2>Grid Directive</h2>

<h4>Requriements (all provided in js/lib)</h4>
<ul>
    <li> angular.js</li>
    <li> underscore.js</li>
    <li> less.js (optional)</li>
</ul>
<h4>Description</h4>
<p>
    Grid directive displays tabular data inside a table.
    <br />
    Grid parameters <code>(key, columns, url)</code> can be provided in HTML markup, specified in config file or entered in the prompt box (columns only).
    <br/>
    Data is loaded form a server or Browser's local storage specified in attribute <code>url="users.php"</code>
    <br />
    Rows can be added, deleted and modified.
</p>

<h4>The following are ways to instantiate grid:</h4>
<ul>
    <li>
        Option 1: Specify all grid params in HTML markup:<br />
            <code>&lt;grid key="users" columns="First,Last,Email" url="data/users.php"&gt;&lt;/grid&gt;</code><br />
    </li>
    <br />
    <li>
        Option 2: Specify grid some params in HTML markup:<br />
            a. <code>&lt;grid key="users" url="data/users.php"&gt;&lt;/grid&gt;</code><br />
            b. <code>&lt;grid key="managers" columns="First,Last,Email"&gt;&lt;/grid&gt;</code><br />
    </li>
    <br />
    <li>
        Option 3: Only specify grid <code>key</code> param in HTML markup:<br />
            <code>&lt;grid key="users"&gt;&lt;/grid&gt;</code><br />
    </li>
</ul>

<h4>Config</h4>
<code><pre>
angular.module('app.gridConf', [])
    .factory('config', function() {
        return {
            'meta' : {
                'users'  : {
                    'url'     : 'data/users.php',
                    'columns' : ['First', 'Last' , 'Email']
                },
                'managers' : {
                    'url'     : 'data/managers.php'
                },
                'localstuff' : {
                    'columns' : ['First', 'Last' , 'Local']
                }
            },
...
</pre></code>
