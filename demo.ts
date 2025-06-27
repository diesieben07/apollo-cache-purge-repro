import {ApolloClient, ApolloLink, type FetchResult, gql, InMemoryCache} from '@apollo/client/core';
import type {NextLink, Operation} from '@apollo/client/link/core/types';
import {Observable} from "zen-observable-ts";

/**
 * Set to true to observe that it works fine when returnPartialData is enabled
 */
const returnPartialData = false;
/**
 * Set to true to make the "server" return different data every time, demonstrating that this also
 * does not observe the bug
 */
const returnDifferentData = false;

let index = 0;

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new ApolloLink((operation: Operation, forward: NextLink) => {
    return new Observable(observer => {
      const timeout = setTimeout(() => {
        let result = {
          data: {
            message: "Hello World" + (returnDifferentData ? (index++) : ""),
          }
        } satisfies FetchResult;
        console.log('FetchResult', result);
        observer.next(result);
        observer.complete();
      }, 500);
      return () => clearTimeout(timeout);
    });
  }),
});

client.watchQuery({
    query: gql`
      query GetMessage {
        message
      }
    `,
  notifyOnNetworkStatusChange: true,
  returnPartialData,
}).subscribe({
  next: v => console.log('data', v)
});

setTimeout(() => client.cache.reset(), 1000);
