/* eslint-disable */
import { NextApiRequest, NextApiResponse } from "next";
import { Block } from "../../types";

let blocks: Block[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      res.status(200).json(blocks);
      break;
    case "POST":
      const newBlock: Block = req.body;
      blocks.push(newBlock);
      res.status(201).json(newBlock);
      break;
    case "PUT":
      const updatedBlock: Block = req.body;
      blocks = blocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      );
      res.status(200).json(updatedBlock);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
