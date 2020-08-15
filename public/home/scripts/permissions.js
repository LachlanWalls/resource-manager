(() => {

    // bitfield manipulation and verification

    function generatePermStructures(perms) {
        const pad = (num, len, val = '0') => val.repeat(len - num.length) + String(num)
        const binToDec = val => parseInt(val, 2)
        const decToBin = val => val.toString(2)
        
        const decodeBitfield = dec => {
            const bin = pad(decToBin(dec), perms.length)
            let userperms = perms.filter((p, i) => bin.split('')[i] === '1')
            return userperms
        }
        
        const encodeBitfield = userperms => {
            let bfarr = perms.map(p => userperms.includes(p) ? '1':'0')
            return binToDec(bfarr.join(''))
        }
        
        const cleanBitfield = bf => {
            let userperms = decodeBitfield(bf)
            userperms = userperms.filter(p => perms.includes(p))
            return encodeBitfield(userperms)
        }
        
        const hasPerm = (dec, p) => decodeBitfield(dec).includes(p)
        const checkPerm = (dec, p) => decodeBitfield(dec).includes(p) || decodeBitfield(dec).includes('ADMIN')
        
        const addPerm = (dec, p) => {
            let userperms = decodeBitfield(dec)
            if (userperms.indexOf(p) === -1) userperms.push(p)
            return encodeBitfield(userperms)
        }
        
        const removePerm = (dec, p) => {
            let userperms = decodeBitfield(dec)
            if (userperms.indexOf(p) > -1) userperms.splice(userperms.indexOf(p), 1)
            return encodeBitfield(userperms)
        }
        
        return {
            encodeBitfield,
            decodeBitfield,
            cleanBitfield,
            hasPerm,
            checkPerm,
            addPerm,
            removePerm
        }
    }

    // allow for usage of this file both client-side (native JS) and server-side (Node)
    if (typeof window !== 'undefined') window.permissions = generatePermStructures(window.CONSTANTS.PERMISSIONS)
    else module.exports = generatePermStructures

})()