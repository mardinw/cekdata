import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import routes from './routes/routes.js'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

app.use(logger());
app.use(prettyJSON( { space: 4}));

app.route('/', routes)

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
