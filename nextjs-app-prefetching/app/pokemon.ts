import { queryOptions } from '@tanstack/react-query'

export const pokemonOptions = queryOptions({
  queryKey: ['pokemon'],
  queryFn: async () => {

    console.log("pokemon API called......");

    const response = await fetch('https://pokeapi.co/api/v2/pokemon/25')

    await new Promise((r) => setTimeout(r, 10000));
    

    return response.json()
  },
})
