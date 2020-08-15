(() => {

    const PERMISSIONS = [
        'ADMIN',
        'MANAGE_USERS',
        'MANAGE_LOANS',
        'MANAGE_TAGS',
        'MANAGE_RESOURCES'
    ]

    const dat = {
        PERMISSIONS
    }
    
    if (typeof window !== 'undefined') window.CONSTANTS = dat
    else module.exports = dat

})()