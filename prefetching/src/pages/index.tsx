import React, { useReducer } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const getCharacters = async (): Promise<{
  results: Array<{ id: number; name: string }>
}> => {
  await new Promise((r) => setTimeout(r, 500))
  const response = await fetch('https://rickandmortyapi.com/api/character/');
  return await response.json();
}

const getCharacter = async (selectedChar: number) => {
  await new Promise((r) => setTimeout(r, 500))
  const response = await fetch(
    `https://rickandmortyapi.com/api/character/${selectedChar}`,
  )
  return await response.json();
}

export default function Example() {
  const queryClient = useQueryClient()
  //const rerender = React.useState(0)[1]
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const [selectedChar, setSelectedChar] = React.useState(1)

  const charactersQuery = useQuery({
    queryKey: ['characters'],
    queryFn: getCharacters,
  })

  const characterQuery = useQuery({
    queryKey: ['character', selectedChar],
    queryFn: () => getCharacter(selectedChar),
  })

  return (
    <div className="App">
      <p>
        Hovering over a character will prefetch it, and when it's been
        prefetched it will turn <strong>bold</strong>. Clicking on a prefetched
        character will show their stats below immediately.
      </p>
      <h2>Characters</h2>
      {charactersQuery.isPending ? (
        'Loading...'
      ) : (
        <>
          <ul>
            {charactersQuery.data?.results.map((char) => (
              <li
                key={char.id}
                onClick={() => {
                  setSelectedChar(char.id)
                }}
                onMouseEnter={async () => {
                  await queryClient.prefetchQuery({
                    queryKey: ['character', char.id],
                    queryFn: () => getCharacter(char.id),
                    staleTime: 10 * 1000, // only prefetch if older than 10 seconds
                  })
                  // 화면에 prefetchQuery 여부 표시 위해 강제 re-render\
                  // 실제로 데이터는 update 됨
                  setTimeout(() => {
                    forceUpdate();
                  }, 1)
                }}
              >
                <div
                  style={
                    queryClient.getQueryData(['character', char.id]) ? { fontWeight: 'bold' } : {}
                  }
                >
                  {char.id} - {char.name}
                </div>
              </li>
            ))}
          </ul>

          <h3>Selected Character</h3>
          {characterQuery.isPending ? (
            'Loading...'
          ) : (
            <>
              <pre>{JSON.stringify(characterQuery.data, null, 2)}</pre>
            </>
          )}
          <ReactQueryDevtools initialIsOpen />
        </>
      )}
    </div>
  )
}
