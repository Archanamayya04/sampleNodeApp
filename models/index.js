const availableCollections = {
    // supressionList: "suppression-list"
    admin: "admin",
    admin_tokens: "admin-tokens",
    "user_tokens": "user-tokens",
    "contacts_hard_bounce": "contacts_hard_bounce" // global suppression list
}

const dynamicCollections = {
    "contacts_spam": "contacts_spam_<replace_me_with_user_id>" // user_id level suppression list
}

module.exports = { availableCollections, dynamicCollections }