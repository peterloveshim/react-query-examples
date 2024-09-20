import type { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if(!req.query.cursor || !req.query.pageSize) {
      throw new Error("Invalid Parameter");
    }

    const cursor = Number(req.query.cursor);
    const pageSize = Number(req.query.pageSize);

    const data = Array(pageSize)
      .fill("0")
      .map((_, i) => {
        return {
          name: 'Project ' + (i + cursor) + ` (server time: ${Date.now()})`,
          id: i + cursor,
        }
      })
  
    const nextId = cursor < 20 ? data[data.length - 1].id + 1 : null
    const previousId = cursor > -20 ? data[0].id - pageSize : null
  
    console.log("prevId : ", previousId);
    console.log("page-- : ", cursor);
    console.log("nextId : ", nextId);
    console.log("data-- : ", data);
  
    setTimeout(() => res.json({ data, nextId, previousId }), 300)
  } catch(err) {
    throw err;
  }

}
