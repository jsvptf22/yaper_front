import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

let client: ApolloClient<NormalizedCacheObject>;

export class GraphqlService {
  static getClient(): ApolloClient<any> {
    if (!client) {
      const httpLink = new HttpLink({
        uri: `${import.meta.env.VITE_HTTP_GRAPHQL}`,
      });

      const wsLink = new GraphQLWsLink(
        createClient({
          url: `${import.meta.env.VITE_WS_GRAPHQL}`,
        }),
      );

      const splitLink = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink,
      );

      client = new ApolloClient({
        link: splitLink,
        cache: new InMemoryCache(),
      });
    }
    return client;
  }
}
