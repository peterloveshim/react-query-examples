import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if(!req.query.page || typeof req.query.page !== 'string') {
    throw new Error("Invalid Parameter")
  }

  const page = parseInt(req.query.page) || 0

  const pageSize = 10

  const projects = Array(pageSize)
    .fill(0)
    .map((_, i) => {
      const id = page * pageSize + (i + 1)
      return {
        name: 'Project ' + id,
        id,
      }
    })

  await new Promise((r) => setTimeout(r, 1000));

  res.json({ projects, hasMore: page < 9 })
}
