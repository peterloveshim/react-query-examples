import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DogList } from './DogList'

const appRoot = document.getElementById('root')

if (appRoot) {
  const queryClient = new QueryClient()
  // mode: 'open' => 메인 페이지 맥락에서 작성된 JavaScript를 사용하여 shadow DOM에 접근할 수 있음
  // mode: 'closed' => 외부로부터 shadow DOM에 접근할 수 없음
  const shadowRoot = appRoot.attachShadow({ mode: 'open' })
  const root = ReactDOM.createRoot(shadowRoot)

  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <div
          style={{
            width: '100vw',
            padding: '30px',
          }}
        >
          <h2>Dog Breeds</h2>
          <DogList />
        </div>
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
          shadowDOMTarget={appRoot.shadowRoot!}
        />
      </QueryClientProvider>
    </React.StrictMode>,
  )
}
