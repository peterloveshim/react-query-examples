import { skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { search } from './algolia'

export type UseAlgoliaOptions = {
  indexName: string
  query: string
  hitsPerPage?: number
  staleTime?: number
  gcTime?: number
}

export default function useAlgolia<TData>({
  indexName,
  query,
  hitsPerPage = 10,
  staleTime,
  gcTime,
}: UseAlgoliaOptions) {
  const queryInfo = useInfiniteQuery({
    // queryKey : 자료구조 식별자로 사용
    queryKey: ['algolia', indexName, query, hitsPerPage],
    // skipToken : 검색어(query)가 없는 경우 react-query 비활성화 처리
    queryFn: query
      ? ({ pageParam }) =>
          search<TData>({ indexName, query, pageParam, hitsPerPage })
      : skipToken,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => { 
      console.log("lastPage : ", lastPage); // queryFn 의 리턴값
      console.log("time : ", new Date().getTime())
      return lastPage.nextPage
    },
    staleTime, // 해당 시간 간격으로 queryFn call
    gcTime, // 해당 시간 동안 사용하지 않을 경우 가비지콜렉터로 수집됨
  })

  const hits = queryInfo.data?.pages.map((page) => page.hits).flat()

  console.log(Object.keys(queryInfo));

  return { ...queryInfo, hits }
}
