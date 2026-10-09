import { resolve } from "node:path"
import express from "express"

const client = resolve(import.meta.dirname, "../../client/dist")
const server = express()

server.use(express.json())
server.use(express.static(client))

export default server
