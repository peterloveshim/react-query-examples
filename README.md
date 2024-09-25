## 예제 설명

```
$ npm -v
10.8.1

$ node -v
v20.16.0
```

### algolia
- **페이지 당 n개 게시글 페칭**
- useInfiniteQuery

### auto-refetching
- 데이터 추가, 삭제 즉시 반영, 주기적 데이터 페칭
- refetchInterval 옵션, 설정된 시간 간격으로 API call > 데이터 페칭
- useMutation (mutationFn, mutate, onSuccess), 이벤트 발생시 데이터 변경, 서버와의 동기화 상관없이 먼저 UI 처리 후 요청 결과에 따라 UI 업데이트
- queryClient.invalidateQueries(), 사용 즉시 데이터 refetch됨 

### basic
- 게시글 리스트에서 게시글 상세 보기
- queryClient default option 설정
- useQuery
- useQueryClient(현재 QueryClient 객체 리턴)
- PersistQueryClientProvider(데이터 저장 로드 설정), createSyncStoragePersister (저장소 설정) => 프로그램 재시작시, 새로 고침시 데이터를 유지함
 
### infinite-query-with-max-pages
- 페이지 단위 게시글 리스트 조회
- 이전(fetchPreviousPage) 혹은 다음 (fetchNextPage) 페이지 단위별 리스트 추가 및 화면 출력 게시글 개수 관리 (maxPages)
- 아래 data.pages.map 확인
```js
data.pages.map((page) => (
  <div key={page.nextId}>
    {page.data.map((item) => (
      <p key={item.id}>
        {item.name}
      </p>
    ))}
  </div>
))
```

### load-more-infinite-scroll
- 페이지 스크롤 하단(ref) 터치시 inView = true, react-intersection-observer 모듈
- 위 이벤트 발생시 데이터 조회 
```js
useEffect(() => {
  if (inView) {
    fetchNextPage()
  }
}, [fetchNextPage, inView])
```
- maxPages 는 설정 안함

### nextjs
- useQuery 바인딩 훅에 변수 값 전달(limit), useState 같이 사용
- dehydrate : 서버에서 React Query의 상태를 클라이언트로 전송할 수 있는 형태로 만들기 위해 사용, 서버에서 미리 prefetch 한 데이터를 가져와 직렬화 한 후 클라이언트로 전송, 직렬화된 데이터는 DehydratedState 형태로 표현되며 클라이언트 측에서 hydrate함수를 통해 다시 React Query 상태로 변환됨
- hydrate : 클라이언트 측에서 직렬화된 상태를 받아 이를 React Query의 상태로 변환, 이 과정은 서버에서 미리 가져온 데이터를 클라이언트의 쿼리 캐시에 적용하여 네트워크 요청 없이 데이터를 사용할 수 있게 함

### nextjs-app-prefetching
- [Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- ***npm run build*** 에러 발생함
- 임시 해결 방법으로 .env 파일 생성 후 아래 내용 추가, 데이터 fetch failed가 원인
```
NODE_TLS_REJECT_UNAUTHORIZED=0
```
- useSuspenseQuery : 모든 쿼리를 미리 가져오기만 한다면 useQuery를 대체할 수 있음, 클라이언트에서 상태를 로드할 때  ```<Suspense>``` 를 사용할 수 있다.
- queryClient.prefetchQuery(...)는 절대로 오류를 던지지 않음
- dehydrate(...)는 실패한 쿼리가 아닌 성공한 쿼리만 포함
- 실패한 쿼리는 클라이언트에서 다시 시도 되고 서버에서는 렌더링된 출력에는 전체 콘텐츠 대신 로딩 상태가 포함
- 특별히 오류를 잡고 싶을 때는 queryClient.fetchQuery(...)를 대신 사용한다.
```js
try {
  result = await queryClient.fetchQuery(...)
} catch (error) {
  // Handle the error, refer to your framework documentation
}
```
- [1]페이지 최초 진입시, [2]페이지 새로 고침시 de/hydrate 됨(서버단에서 queryFn call 한 데이터를 브라우저에서 사용)
- 브라우저에서 staleTime 초과시 queryFn call 하고 해당 결과 데이터가 브라우저에 업데이트 된다.
- 서버단에서는 staleTime 이 무조건 30초가 기본인 것으로 보이고 옵션 설정 못찾음.
- [1], [2] 이외에는 de/hydrate 이 되지 않는 것으보임(브라우저가 서버단에서의 queryFn 결과값을 출력하지 않는다)

### nextjs-suspense-streaming
- 데이터 페치 지연 처리 예
- useSuspenseQuery + Suspense
