(() => {

    const PERMISSIONS = [
        'OWNER',
        'ADMIN',
        'MANAGE_USERS',
        'MANAGE_RESOURCES'
    ]

    const dat = {
        PERMISSIONS
    }
    
    // allow for usage of this file both client-side (native JS) and server-side (Node)
    if (typeof window !== 'undefined') window.CONSTANTS = dat
    else module.exports = dat

})()