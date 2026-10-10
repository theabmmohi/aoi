import { resolve } from "node:path"
import express from "express"
import api from "@/api/api"

const client = resolve(import.meta.dirname, "../../client/dist")
const server = express()

server.use(express.json())
server.use(express.static(client))
server.use("/api", api)

export default server
