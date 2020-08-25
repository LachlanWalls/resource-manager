const express = require('express')
const utils = require('../scripts/utils')
const constants = require('../scripts/constants')
const permissions = require('../scripts/permissions')

module.exports = {
    path: '/api/resources',
    generate: (config, db) => {

        const router = express.Router()

        router.get('/', async(req, res) => {
            let resources = await db.query('SELECT * FROM resources')
            let tags = await db.query('SELECT * FROM tags')

            const processResource = async(resource) => {
                resource.type = ['singular', 'instanced'][resource.type]
                if (resource.type === 'instanced') resource.instances = await db.query('SELECT * FROM resource_instances WHERE resource = ?', [resource.id])
                resource.attachments = await db.query('SELECT * FROM resource_attachments WHERE res_id = ?', [resource.id])
                let rtags = await db.query('SELECT * FROM resource_tags WHERE res_id = ?', [resource.id])
                resource.tags = rtags.map(t => tags.find(tg => tg.id === (t.tag_id || 'NONE')) || { "name": t.tag_id, "reference": t.tag_id, "description": "" })
            }

            await Promise.all(resources.map(res => processResource(res)))
            return res.send(resources)
        })

        router.post('/', async(req, res) => {
            if (!req.body.name) return res.send({"err": "missing-name"})
            if (!['instanced', 'singular'].includes(req.body.type)) return res.send({"err": "missing-type"})

            const gr = () => Math.floor(Math.random() * 10)
            const id = `R-${gr()}${gr()}${gr()}${gr()}-${gr()}${gr()}${gr()}${gr()}-${gr()}${gr()}${gr()}${gr()}`

            const name = req.body.name
            const reference = name.replace(/[^0-9A-Za-z-]/g, '-').toLowerCase()
            const type = ['singular', 'instanced'].indexOf(req.body.type)
            const desc = req.body.description || null

            await db.query('INSERT INTO resources (`id`, `name`, `reference`, `type`, `description`) VALUES (?, ?, ?, ?, ?)', [id, name, reference, type, desc])

            return res.send({
                "id": id,
                "name": name,
                "reference": reference,
                "type": req.body.type,
                "description": desc
            })
        })

        router.get('/:resource', async(req, res) => {
            let resource = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.resource])
            if (resource.length === 0) return res.status(404).send({"err": "unknown-resource"})
            resource = resource[0]

            resource.type = ['singular', 'instanced'][resource.type]
            if (resource.type === 'instanced') resource.instances = await db.query('SELECT * FROM resource_instances WHERE resource = ?', [resource.id])
            resource.attachments = await db.query('SELECT * FROM resource_attachments WHERE res_id = ?', [resource.id])
            let rtags = await db.query('SELECT * FROM resource_tags WHERE res_id = ?', [resource.id])
            resource.tags = rtags.map(t => tags.find(tg => tg.id === (t.tag_id || 'NONE')) || { "name": t.tag_id, "reference": t.tag_id, "description": "" })

            return res.send(resource)
        })

        router.put('/:resource', async(req, res) => {
            let resource = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.resource])
            if (resource.length === 0) return res.status(404).send({"err": "unknown-resource"})
            resource = resource[0]

            if (req.body.name) {
                const newname = req.body.name
                const newreference = newname.replace(/[^0-9A-Za-z-]/g, '-').toLowerCase()
                const testresource = await db.query('SELECT * FROM resources WHERE reference = ?', [newreference])
                if (testresource.length > 0) return res.send({"err": "name-in-use"})
                await db.query('UPDATE resources SET name = ?, reference = ? WHERE id = ?', [newname, newreference, resource.id])
            }

            if (req.body.description) {
                await db.query('UPDATE resources SET description = ? WHERE id = ?', [req.body.description, resource.id])
            }

            resource = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.resource])
            return res.send(resource[0])
        })

        router.delete('/:resource', async(req, res) => {
            if (req.params.resource === 'R-1234-5678-9012') return res.status(204).send()

            let resource = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.resource])
            if (resource.length === 0) return res.status(404).send({"err": "unknown-resource"})

            await db.query('DELETE FROM resources WHERE id = ?', [req.params.resource])

            return res.status(204).send()
        })

        return router

    }
}