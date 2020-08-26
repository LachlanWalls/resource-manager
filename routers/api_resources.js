const express = require('express')
const utils = require('../scripts/utils')
const constants = require('../scripts/constants')
const permissions = require('../scripts/permissions')

module.exports = {
    path: '/api/resources',
    generate: (config, db) => {

        const router = express.Router()

        async function getResource(identifier) {
            let res = await db.query('SELECT * FROM resources WHERE id = ?', [identifier])
            if (res.length > 0) return res[0]
            res = await db.query('SELECT * FROM resources WHERE reference = ?', [identifier])
            if (res.length > 0) return res[0]
            return null
        }

        async function processResource(resource) {
            let tags = await db.query('SELECT * FROM tags')
            resource.type = ['singular', 'instanced'][resource.type]
            if (resource.type === 'instanced') {
                resource.instances = await db.query('SELECT * FROM resource_instances WHERE resource = ?', [resource.id])
                for (let inst of resource.instances) {
                    inst.attachments = await db.query('SELECT * FROM resource_attachments WHERE res_id = ?', [inst.id])
                    for (let att of inst.attachments) att.iscover = Boolean(att.iscover)
                }
            }
            resource.attachments = await db.query('SELECT * FROM resource_attachments WHERE res_id = ?', [resource.id])
            let rtags = await db.query('SELECT * FROM resource_tags WHERE res_id = ?', [resource.id])
            resource.tags = rtags.map(t => tags.find(tg => tg.id === (t.tag_id || 'NONE')) || { "name": t.tag_id, "reference": t.tag_id, "description": "" })
            return resource
        }

        async function getAndProcessResource(identifier) {
            let res = await getResource(identifier)
            if (!res) return null
            let proc = await processResource(res)
            return proc
        }

        router.get('/', async(req, res) => {
            let resources = await db.query('SELECT * FROM resources')
            await Promise.all(resources.map(res => processResource(res)))
            return res.send(resources)
        })

        router.post('/', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

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
            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})
            return res.send(resource)
        })

        router.put('/:resource', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})

            if ('name' in req.body) {
                const newname = req.body.name
                const newreference = newname.replace(/[^0-9A-Za-z-]/g, '-').toLowerCase()
                const testresource = await db.query('SELECT * FROM resources WHERE reference = ?', [newreference])
                if (testresource.length > 0) return res.send({"err": "name-in-use"})
                await db.query('UPDATE resources SET name = ?, reference = ? WHERE id = ?', [newname, newreference, resource.id])
            }

            if ('description' in req.body) {
                await db.query('UPDATE resources SET description = ? WHERE id = ?', [req.body.description, resource.id])
            }

            resource = await getAndProcessResource(resource.id)
            return res.send(resource)
        })

        router.delete('/:resource', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            if (req.params.resource === 'R-1234-5678-9012') return res.status(204).send()

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})

            await db.query('DELETE FROM resources WHERE id = ?', [req.params.resource])

            return res.status(204).send()
        })

        router.post('/:resource/instances', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})
            if (resource.type !== 'instanced') return res.send({"err": "invalid-resource-type"})

            const gr = () => Math.floor(Math.random() * 10)
            const id = `I-${gr()}${gr()}${gr()}${gr()}-${gr()}${gr()}${gr()}${gr()}-${gr()}${gr()}${gr()}${gr()}`
            const desc = req.body.description || null

            await db.query('INSERT INTO resource_instances (`id`, `resource`, `description`) VALUES (?, ?, ?)', [id, resource.id, desc])

            return res.send({
                "id": id,
                "resource": resource.id,
                "description": desc
            })
        })

        router.put('/:resource/instances/:instance', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})

            let instance = resource.instances.find(inst => inst.id === req.params.instance)
            if (!instance) return res.status(404).send({"err": "unknown-instance"})

            if ('description' in req.body) {
                await db.query('UPDATE resource_instances SET description = ? WHERE id = ?', [req.body.description, instance.id])
                instance.description = req.body.description
            }

            return res.send(instance)
        })

        router.delete('/:resource/instances/:instance', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})

            let instance = resource.instances.find(inst => inst.id === req.params.instance)
            if (!instance) return res.status(404).send({"err": "unknown-instance"})

            await db.query('DELETE FROM resource_instances WHERE id = ?', [instance.id])

            return res.status(204).send()
        })

        router.put('/:resource/attachments/:attachment', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})

            let attachment = resource.attachments.find(att => att.id === req.params.attachment)
            if (!attachment) return res.status(404).send({"err": "unknown-attachment"})

            if ('description' in req.body) {
                await db.query('UPDATE resource_attachments SET description = ? WHERE id = ?', [req.body.description, attachment.id])
                attachment.description = req.body.description
            }

            if ('iscover' in req.body) {
                await db.query('UPDATE resource_attachments SET iscover = ? WHERE id = ?', [req.body.iscover ? 1:0, attachment.id])
                attachment.iscover = req.body.iscover
            }

            if ('url' in req.body) {
                await db.query('UPDATE resource_attachments SET url = ? WHERE id = ?', [req.body.url, attachment.id])
                attachment.url = req.body.url
            }

            return res.send(attachment)
        })

        router.delete('/:resource/attachments/:attachment', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})

            let attachment = resource.attachments.find(att => att.id === req.params.attachment)
            if (!attachment) return res.status(404).send({"err": "unknown-attachment"})

            await db.query('DELETE FROM resource_attachments WHERE id = ?', [attachment.id])

            return res.status(204).send()
        })

        router.put('/:resource/instances/:instance/attachments/:attachment', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})

            let instance = resource.instances.find(inst => inst.id === req.params.instance)
            if (!instance) return res.status(404).send({"err": "unknown-instance"})

            let attachment = instance.attachments.find(att => att.id === req.params.attachment)
            if (!attachment) return res.status(404).send({"err": "unknown-attachment"})

            if ('description' in req.body) {
                await db.query('UPDATE resource_attachments SET description = ? WHERE id = ?', [req.body.description, attachment.id])
                attachment.description = req.body.description
            }

            if ('iscover' in req.body) {
                await db.query('UPDATE resource_attachments SET iscover = ? WHERE id = ?', [req.body.iscover ? 1:0, attachment.id])
                attachment.iscover = req.body.iscover
            }

            if ('url' in req.body) {
                await db.query('UPDATE resource_attachments SET url = ? WHERE id = ?', [req.body.url, attachment.id])
                attachment.url = req.body.url
            }

            return res.send(attachment)
        })

        router.delete('/:resource/instances/:instance/attachments/:attachment', async(req, res) => {
            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_RESOURCES')
            if (permres.err) return res.send(permres)

            let resource = await getAndProcessResource(req.params.resource)
            if (!resource) return res.status(404).send({"err": "unknown-resource"})

            let instance = resource.instances.find(inst => inst.id === req.params.instance)
            if (!instance) return res.status(404).send({"err": "unknown-instance"})

            let attachment = instance.attachments.find(att => att.id === req.params.attachment)
            if (!attachment) return res.status(404).send({"err": "unknown-attachment"})

            await db.query('DELETE FROM resource_attachments WHERE id = ?', [attachment.id])

            return res.status(204).send()
        })

        return router

    }
}