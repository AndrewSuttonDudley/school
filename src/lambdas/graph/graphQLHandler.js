import { graphql } from 'graphql';
import GraphiQL from 'raw-loader!graphiql/graphiql.min';
import GraphiQlCss from 'raw-loader!graphiql/graphiql.css';
// import { makeExecutableSchema } from 'graphql-tools';
import log from '../../lib/log';
import schema from './schema';

// Begin queryGraphQL
module.exports.queryGraphQL = (event, context, callback) => {
  log.info(`In queryGraphQL with event.body: ${JSON.stringify(event.body, null, 2)}`);
  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    log.error('Can\'t parse event.body as JSON', error);
    const response = {
      statusCode: 500,
    };
    return callback(null, response);
  }
  return graphql(schema, parsedBody.query)
  .then((result) => {
    log.info(`result: ${JSON.stringify(result, null, 2)}`);
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3003',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(result),
    };
    log.info(`response: ${JSON.stringify(response, null, 2)}`);
    return callback(null, response);
  });
};
// End queryGraphQL

// Begin graphiQL
module.exports.graphiQL = (event, context, callback) => {
  log.info(`In graphiQL with event: ${JSON.stringify(event, null, 2)}`);

  const body = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <style>
    body {
      height: 100%;
      margin: 0;
      width: 100%;
      overflow: hidden;
    }
    #graphiql {
      height: 100vh;
    }
  </style>

  <!--
    This GraphiQL example depends on Promise and fetch, which are available in
    modern browsers, but can be "polyfilled" for older browsers.
    GraphiQL itself depends on React DOM.
    If you do not want to rely on a CDN, you can host these files locally or
    include them directly in your favored resource bunder.
  -->
  <script src="//cdn.jsdelivr.net/es6-promise/4.0.5/es6-promise.auto.min.js"></script>
  <script src="//cdn.jsdelivr.net/react/15.4.2/react.min.js"></script>
  <script src="//cdn.jsdelivr.net/react/15.4.2/react-dom.min.js"></script>

  <!--
    These two files can be found in the npm module, however you may wish to
    copy them directly into your environment, or perhaps include them in your
    favored resource bundler.
   -->
  <style>${GraphiQlCss}</style>
  <script>${GraphiQL}</script>

</head>
<body>
  <div id="graphiql">Loading...</div>
  <script>
    /**
     * This GraphiQL example illustrates how to use some of GraphiQL's props
     * in order to enable reading and updating the URL parameters, making
     * link sharing of queries a little bit easier.
     *
     * This is only one example of this kind of feature, GraphiQL exposes
     * various React params to enable interesting integrations.
     */
    // Parse the search string to get url parameters.
    var search = window.location.search;
    var parameters = {};
    search.substr(1).split('&').forEach(function (entry) {
      var eq = entry.indexOf('=');
      if (eq >= 0) {
        parameters[decodeURIComponent(entry.slice(0, eq))] =
          decodeURIComponent(entry.slice(eq + 1));
      }
    });
    // if variables was provided, try to format it.
    if (parameters.variables) {
      try {
        parameters.variables =
          JSON.stringify(JSON.parse(parameters.variables), null, 2);
      } catch (e) {
        // Do nothing, we want to display the invalid JSON as a string, rather
        // than present an error.
      }
    }
    // When the query and variables string is edited, update the URL bar so
    // that it can be easily shared
    function onEditQuery(newQuery) {
      parameters.query = newQuery;
      updateURL();
    }
    function onEditVariables(newVariables) {
      parameters.variables = newVariables;
      updateURL();
    }
    function onEditOperationName(newOperationName) {
      parameters.operationName = newOperationName;
      updateURL();
    }
    function updateURL() {
      var newSearch = '?' + Object.keys(parameters).filter(function (key) {
        return Boolean(parameters[key]);
      }).map(function (key) {
        return encodeURIComponent(key) + '=' +
          encodeURIComponent(parameters[key]);
      }).join('&');
      history.replaceState(null, null, newSearch);
    }
    // Defines a GraphQL fetcher using the fetch API. You're not required to
    // use fetch, and could instead implement graphQLFetcher however you like,
    // as long as it returns a Promise or Observable.
    function graphQLFetcher(graphQLParams) {
      // This example expects a GraphQL server at the path /graphql.
      // Change this to point wherever you host your GraphQL server.
      return fetch('graphql', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphQLParams),
        credentials: 'include',
      }).then(function (response) {
        return response.text();
      }).then(function (responseBody) {
        try {
          return JSON.parse(responseBody);
        } catch (error) {
          return responseBody;
        }
      });
    }
    // Render <GraphiQL /> into the body.
    // See the README in the top level of this module to learn more about
    // how you can customize GraphiQL by providing different values or
    // additional child elements.
    ReactDOM.render(
      React.createElement(GraphiQL, {
        fetcher: graphQLFetcher,
        query: parameters.query,
        variables: parameters.variables,
        operationName: parameters.operationName,
        onEditQuery: onEditQuery,
        onEditVariables: onEditVariables,
        onEditOperationName: onEditOperationName
      }),
      document.getElementById('graphiql')
    );
  </script>
</body>
</html>
  `;

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body,
  };
  return callback(null, response);
};
// End graphiQL
