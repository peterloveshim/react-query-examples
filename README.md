## 예제 설명

```
$ npm -v
10.8.1

$ node -v
v20.16.0
```

### algolia
- __페이지 당 n개 게시글 페칭__
- useInfiniteQuery

### auto-refetching
- **데이터 추가, 삭제 즉시 반영, 주기적 데이터 페칭**
- refetchInterval 옵션, 설정된 시간 간격으로 API call > 데이터 페칭
- useMutation (mutationFn, mutate, onSuccess)
  - 이벤트 발생시 데이터 변경, 서버와의 동기화 상관없이 먼저 UI 처리 후 요청 결과에 따라 UI 업데이트
- queryClient.invalidateQueries()
  - 데이터 refetch됨 

### basic
- **게시글 리스트에서 게시글 상세 보기**
- queryClient default option 설정
- useQuery
- useQueryClient(현재 QueryClient 객체 리턴)
- PersistQueryClientProvider(데이터 저장 로드 설정) + createSyncStoragePersister (저장소 설정)
  - *프로그램 재시작시, 새로 고침시 데이터를 유지함*
 
### infinite-query-with-max-pages
- **페이지 단위 게시글 리스트 조회**
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
- dehydrate
  - 서버에서 React Query의 상태를 클라이언트로 전송할 수 있는 형태로 만들기 위해 사용
  - 서버에서 미리 prefetch 한 데이터를 가져와 직렬화 한 후 클라이언트로 전송
  - 직렬화된 데이터는 DehydratedState 형태로 표현되며 클라이언트 측에서 hydrate함수를 통해 다시 React Query 상태로 변환됨
- hydrate
  - 클라이언트 측에서 직렬화된 상태를 받아 이를 React Query의 상태로 변환
  - 이 과정은 서버에서 미리 가져온 데이터를 클라이언트의 쿼리 캐시에 적용하여 네트워크 요청 없이 데이터를 사용할 수 있게 함

### nextjs-app-prefetching
- [Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- ***npm run build*** 에러 발생함
- 임시 해결 방법으로 .env 파일 생성 후 아래 내용 추가, 데이터 fetch failed가 원인
  ```
  NODE_TLS_REJECT_UNAUTHORIZED=0
  ```
- useSuspenseQuery
  - 모든 쿼리를 미리 가져오기만 한다면 useQuery를 대체할 수 있음
  - 클라이언트에서 상태를 로드할 때  ```<Suspense>``` 를 사용할 수 있다.
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
- 서버단에서는 staleTime 이 무조건 30초가 기본인 것으로 보이고 *옵션 설정 못찾음*
- [1], [2] 이외에는 de/hydrate 이 되지 않는 것으보임(브라우저가 서버단에서의 queryFn 결과값을 출력하지 않는다)

### nextjs-suspense-streaming
- **데이터 페치 지연 처리**
- useSuspenseQuery + Suspense

### optimistic-updates-cache
- **데이터 추가 후 해당 데이터 리스트 화면으로 돌아올 때 추가된 상태를 API 응답 결과 전에 미리 볼 수 있음**
- useMutation
  - 직접 쿼리 데이터 변경 반영
- queryClient.cancelQueries
  - 최적화 진행시 외부 refetch를 막는다
  - api 성공 여부 상관없이 일단 query data를 업데이트 하는데 이 시점과 api 성공 후 refetch 처리를 할 때의 시간 공백에 데이터 꼬임을 방지함

### optimistic-updates-ui
- **mutationFn 실패시 재시도 + 에러 핸들링**
- useMutation isPending 시 직전 입력한 variables 데이터를 사용할 수 있음, UI에서 optimistic-updates-cache 예제와 같이 방금 입력한 데이터를 미리 출력하는 효과를 볼 수도 있음

### pagination
- **페이지네이션 처리**
- 데이터 목록에 개별 데이터 미리 보기 기능
- **가능한 빨리 데이터 목록 콘텐츠 레이아웃을 렌더링할 때 유용**
- 최초 페이지 요청 응답시(?page=0), 다음 페이지 데이터도 미리 API 호출 & fetch 처리할 수 있음
  ```js
  // Prefetch the next page!
  React.useEffect(() => {
    if (!isPlaceholderData && data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ['projects', page + 1],
        queryFn: () => fetchProjects(page + 1),
      })
    }
  }, [data, isPlaceholderData, page, queryClient])
  ```
  ```js
  // 서버단 로그
  GET /api/projects?page=0 200 in 1091ms
  GET /api/projects?page=1 200 in 1008ms
  ```
- algolia 예제와 비교, 이 예제에서는 useInfiniteQuery 사용 안함
- useQuery 옵션 > placeholderData
  - 데이터가 캐시에 유지되지 않음(initialData 와 차이), 그러나 다른 캐시된 데이터를 사용할 수 있다
  - 실제 데이터를 백그라운드에서 가져오는 동안 미리 렌더링하는 데이터
  - 로그를 보면 백엔드 요청이 완료되기 전에 미리 fake 데이터를 렌더링함.
- useQuery 옵션 > placeholderData: keepPreviousData
  - 쿼리 키가 변경되더라도 데이터가 재요청되는 동안 우선 직전 성공한 fetch 데이터를 사용함
  - 데이터 fetch가 완료되면 새 데이터로 update됨
- useQuery 리턴 > isPlaceholderData
  - 현재 데이터가 PlaceholderData 인지 여부
  
### playground
- 데이터 추가, 삭제
- 하위 컴포넌트간 데이터 변경
- queryClient.setDefaultOptions
  - staleTime, gcTime 설정 변경
- queryClient.invalidateQueries(/* 쿼리키 X */)
  - 모든 reactquery data refetch
- queryFn 의 fetch 함수에 변수를 전달 하기 위해서 queryKey를 사용
  ```js
  // useQuery hook
  const { status, data, isFetching, error, failureCount, refetch } = useQuery({
    queryKey: ['todos', { filter }],
    queryFn: fetchTodos,
  })

  ...

  // fetchTodos 에 변수 전달
  function fetchTodos({ signal, queryKey: [key, { filter }] }) {
    return new Promise((resolve, reject) => {
      resolve(list.filter((d) => d.name.includes(filter)))
    })
  } 
  ```
- queryFn에서 전달하는 signal: AbortSignal
  - **동일한 요청을 여러번 클릭 등으로 이벤트 발생시 이전 이벤트 중단 요청 처리**
  - 비동기 웹 요청 중단 기능(fetch, axios 가능)
  - 모든 요청보다는 대용량 요청 처리에 적절히 사용
  - 동일 키 요청시 이전 요청이 완료 되지 않을 경우 abort 이벤트 발생함(default)
  - 기본적으로 fetch 나 axios 요청시 옵션에 signal 설정하면 unmount의 경우 자동으로 중단 요청됨
  - 현재 소스 기준에서는 이전 요청이 중단되지 않고 abort 이벤트 캐치만 할 수 있음
    ```js
    queryFn: async ({ signal }) => {
      const todosResponse = await fetch('/todos', {
        // Pass the signal to one fetch
        signal,
      })
      const todos = await todosResponse.json()
    }
    ```
  - [참조] [MDN Web Docs - AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
  - [참조] [Query Cancellation](https://tanstack.com/query/v4/docs/framework/react/guides/query-cancellation)

### prefetching
- 데이터 목록 각 컨텐츠 mouseEnter 시 데이터 prefetch 함
- 컨텐츠 상세보기 페이지 이동시 미리 prefetch한 데이터를 우선 렌더링 후 백그라운드에서 재요청(refetchOnWindowFocus: true) 후 업데이트
- **데이터 목록에서 특정 데이터 상세 보기시 유용**
- queryClient.getQueryData
  - *QueryCache 데이터를 subscription 하지 않고 해당 컴포넌트가 렌더링될 때 한번만 데이터를 읽는다.*

### react-router
- queryClient.ensureQueryData
  - 현재 있는 쿼리 캐시를 가져온다. 없으면 queryClient.fetchQuery를 호출하고 해당 결과값 리턴
- queryClient.fetchQuery
  - 비동기 함수로 fetch 하고 cache a query 할 때 사용
  - data를 resolve 하거나 에러를 던진다. 그래서 직접 try - catch 감싸서 에러 핸들링을 할 수 있음
  - fetch 결과값의 리턴(data resolve)이 필요없다면 prefetchQuery를 사용한다.

### rick-morty
- **공통 fetch 함수**
- 에피소드 목록 및 각 에피소드 상세(등장 인물 포함)
- 인물 목록 및 각 인물 상세(출연한 에피소드 포함)

### shadow-dom
- [shadow DOM](https://developer.mozilla.org/ko/docs/Web/API/Web_components/Using_shadow_DOM)
- ReactQueryDevtools 의 캡슐화 예제
- global css에 영향 받지 않음, 설정에 따라 해당 DOM에 접근 가능