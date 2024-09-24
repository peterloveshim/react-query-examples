import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => {
          // 여기에 실패한 쿼리를 포함한 모든 쿼리가 포함됨
          // query 를 검사하여 로직을 작성해서 탈수화 상태(dehydrated state)에 포함 여부를 정할 수 있음
          // 실패한 쿼리를 포함시켜 재시도를 방지할 수도 있다.
          // true 를 리턴할 경우 dehydration 에 해당 query를 포함
          console.log('query1 : ', defaultShouldDehydrateQuery(query));
          console.log('query2 : ', query.state.status === 'pending');

          // include pending queries in dehydration, dehydration에 보류 중인 쿼리 포함
          return defaultShouldDehydrateQuery(query) || query.state.status === 'pending';
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
