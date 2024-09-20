import type { NextApiRequest, NextApiResponse } from 'next'

// an simple endpoint for getting current list
let list = ['Item 1', 'Item 2', 'Item 3']

export default async (
  req: NextApiRequest,
  res: NextApiResponse<typeof list>,
) => {

  const addItem = req.query.add?.toString(); 
  if (addItem) {
    if (!list.includes(addItem)) {
      list.push(addItem)
    }
  } else if (req.query.clear) {
    list = []
  }

  await new Promise((r) => setTimeout(r, 100))

  res.json(list)
}
