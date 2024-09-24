import React from 'react'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { pokemonOptions } from '@/app/pokemon'
import { getQueryClient } from '@/app/get-query-client'
import { PokemonInfo } from './pokemon-info'

/*
# defaultOptions.queries 는 staleTime 만 적용함

1) 빌드 후 초기 진입시
2) 페이지 새로 고침
- 서버에서 queryFn call, 브라우저에서 queryFn call 하지 않음
- 하이드레이션 처리됨 => 브라우저에 서버에서 queryFn call의 결과 데이터 출력 확인
- 소스 빌드 시 queryFn call 하지만 초기 해당 데이터 사용하는 페이지 진입시 서버에서 queryFn call 다시 함

3) 다른 페이지에서 해당 페이지 재진입시
- 서버 디폴트 30초 초과한 경우, queryFn call 하지만 해당 데이터가 브라우저에 반영 안됨
- 브라우저에서 staleTime 초과한 경우, queryFn call 하고 해당 데이터 브라우저에 반영됨
*/

export default function Home() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(pokemonOptions)

  return (
    <main>
      <h1>Pokemon Info</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PokemonInfo />
      </HydrationBoundary>
    </main>
  )
}
