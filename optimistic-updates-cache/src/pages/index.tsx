import * as React from 'react'

import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const client = new QueryClient()

type Todos = {
  items: ReadonlyArray<{
    id: string
    text: string
  }>
  ts: number
}

async function fetchTodos(): Promise<Todos> {
  const response = await fetch('/api/data')
  return await response.json()
}

const todoListOptions = queryOptions({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})

function Example() {
  const queryClient = useQueryClient()
  const [text, setText] = React.useState('')
  const { isFetching, ...queryInfo } = useQuery(todoListOptions)

  const addTodoMutation = useMutation({
    // { message: 'Could not add item!' } 리턴 받은 경우
    // 새로 추가한 데이터 제거, 롤백 됨
    mutationFn: async (newTodo: string) => {
      console.log("mutationFn call................");
      const response = await fetch('/api/data', {
        method: 'POST',
        body: JSON.stringify({ text: newTodo }),
        headers: { 'Content-Type': 'application/json' },
      })
      return await response.json()
    },
    // When mutate is called:, mutationFn 전에 호출됨
    onMutate: async (newTodo: string) => {
      console.log("onMutate call................");
      console.log("newTodo : ", newTodo);

      setText('')
      // Cancel any outgoing refetch
      // (so they don't overwrite our optimistic update)
      // Optimistic Update 을 진행하면서 외부에 refetch 작업을 막아 overwrite 를 방지함
      await queryClient.cancelQueries(todoListOptions)

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(todoListOptions.queryKey);

      // Optimistically update to the new value
      // mutation 수행 전에 쿼리의 데이터를 먼저 반영해버림
      if (previousTodos) {
        queryClient.setQueryData(todoListOptions.queryKey, {
          ...previousTodos,
          items: [
            ...previousTodos.items,
            { id: Math.random().toString(), text: newTodo },
          ],
        })
      }

      // 일단 add api 실행(mutationFn 호출)되기 전에 query data 에 우선 추가함(update)
      console.log(queryClient.getQueryData(todoListOptions.queryKey));

      return { previousTodos }
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    // api 에서 throw error 시 캐치 되는 부분
    // 실패시 이전 값으로 롤백 처리 위치
    onError: (err, variables, context) => {
      console.log("onError call................");
      if (context?.previousTodos) {
        queryClient.setQueryData<Todos>(['todos'], context.previousTodos)
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      console.log("onSettled call................");
      // 특정 쿼리를 invalid 처리 => 서버 단에서 refetch 되게함
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      // 이 위치에서 mutationFn 성공 시 리턴값 반영 안됨
      // console.log("after invalidateQueries : ", queryClient.getQueryData(todoListOptions.queryKey));
    },
  })

  return (
    <div>
      <p>
        In this example, new items can be created using a mutation. The new item
        will be optimistically added to the list in hopes that the server
        accepts the item. If it does, the list is refetched with the true items
        from the list. Every now and then, the mutation may fail though. When
        that happens, the previous list of items is restored and the list is
        again refetched from the server.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTodoMutation.mutate(text)
        }}
      >
        <input
          type="text"
          onChange={(event) => setText(event.target.value)}
          value={text}
        />
        <button disabled={addTodoMutation.isPending}>Create</button>
      </form>
      <br />
      {queryInfo.isSuccess && (
        <>
          <div>
            {/* The type of queryInfo.data will be narrowed because we check for isSuccess first */}
            Updated At: {new Date(queryInfo.data.ts).toLocaleTimeString()}
          </div>
          <ul>
            {queryInfo.data.items.map((todo) => (
              <li key={todo.id}>{todo.text}</li>
            ))}
          </ul>
          {isFetching && <div>Updating in background...</div>}
        </>
      )}
      {queryInfo.isLoading && 'Loading'}
      {queryInfo.error instanceof Error && queryInfo.error.message}
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <Example />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  )
}
