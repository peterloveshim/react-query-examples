import React from 'react'

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  const queryClient = useQueryClient()
  const [intervalMs, setIntervalMs] = React.useState(1000)
  const [value, setValue] = React.useState('')

  const { status, data, error, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: async (): Promise<Array<string>> => {
      const response = await fetch('/api/data')
      return await response.json()
    },
    // Refetch the data every second
    refetchInterval: intervalMs,
  })

  const addMutation = useMutation({
    // mutationFn : 비동기 작업 수행후 프로미스 리턴
    // mutationFn 의 변수(아래 add)는 addMutation.mutate 에서 전달함
    // invalidateQueries : 즉시 해당 query가 유효하지 않게 되고 백그라운드에서 리페치됨
    mutationFn: (add: string) => fetch(`/api/data?add=${add}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const clearMutation = useMutation({
    mutationFn: () => fetch(`/api/data?clear=1`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  if (status === 'pending') return <h1>Loading...</h1>
  if (status === 'error') return <span>Error: {error.message}</span>

  return (
    <div>
      <h1>Auto Refetch with stale-time set to {intervalMs}ms</h1>
      <p>
        This example is best experienced on your own machine, where you can open
        multiple tabs to the same localhost server and see your changes
        propagate between the two.
      </p>
      <label>
        Query Interval speed (ms):{' '}
        <input
          value={intervalMs}
          onChange={(ev) => setIntervalMs(Number(ev.target.value))}
          type="number"
          step="100"
        />{' '}
        <span
          style={{
            display: 'inline-block',
            marginLeft: '.5rem',
            width: 10,
            height: 10,
            background: isFetching ? 'green' : 'transparent',
            transition: !isFetching ? 'all .3s ease' : 'none',
            borderRadius: '100%',
            transform: 'scale(2)',
          }}
        />
      </label>
      <h2>Todo List</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          addMutation.mutate(value, {
            onSuccess: () => {
              setValue('')
            },
          })
        }}
      >
        <input
          placeholder="enter something"
          value={value}
          onChange={(ev) => setValue(ev.target.value)}
        />
      </form>
      <ul>
        {data.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => {
            clearMutation.mutate()
          }}
        >
          Clear All
        </button>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </div>
  )
}
