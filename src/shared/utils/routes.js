export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORMALITY: "/user-dashboard/formalities",
  },
  ADMIN: {
    DASHBOARD: "/admin-dashboard",
    HOME: "/admin-dashboard/home",
    TICKETS: "/admin-dashboard/tickets",
    TICKET_VIEW: (id = ":id") => `/admin-dashboard/tickets/${id}`,
    CATEGORIES: "/admin-dashboard/categories",
    ACCOUNT_MANAGER: "/admin-dashboard/accountmanager",
    // Proposal template management
    NEW_PROPOSAL_TEMPLATE: "/admin-dashboard/newproposaltemplate",
    PROPOSAL_TEMPLATES: "/admin-dashboard/proposaltemplates",
    UPDATE_PROPOSAL_TEMPLATE: (id = ":id") => `/admin-dashboard/updateproposaltemplate/${id}`,
    VIEW_PROPOSAL_TEMPLATE: (id = ":id") => `/admin-dashboard/viewproposaltemplate/${id}`,
    // User Management
    NEW_USER: "/admin-dashboard/newuser",
    ALL_USERS: "/admin-dashboard/allusers",
    VIEW_USER: (id = ":id") => `/admin-dashboard/view/${id}`,
    UPDATE_USER: (id = ":id") => `/admin-dashboard/update/${id}`,
    // Product Management
    ALL_PRODUCTS: "/admin-dashboard/products",
    NEW_PRODUCT: "/admin-dashboard/newproduct",
    VIEW_PRODUCT: (id = ":id") => `/admin-dashboard/viewproduct/${id}`,
    UPDATE_PRODUCT: (id = ":id") => `/admin-dashboard/updateproduct/${id}`,
    // Subscription Management
    NEW_SUBSCRIPTION: "/admin-dashboard/newSubscriptions",
    ALL_SUBSCRIPTIONS: "/admin-dashboard/subscriptions",
    VIEW_SUBSCRIPTION: (id = ":id") => `/admin-dashboard/subscription/${id}`,
    // Email Template Management
    NEW_EMAIL_TEMPLATE: "/admin-dashboard/newEmail-template",
    ALL_EMAIL_TEMPLATES: "/admin-dashboard/email-templates",
    VIEW_EMAIL_TEMPLATE: (id = ":id") => `/admin-dashboard/email-template/${id}`,
    UPDATE_EMAIL_TEMPLATE: (id = ":id") => `/admin-dashboard/update-email-template/${id}`,
    // Proposal Routes
    ALL_PROPOSALS: "/admin-dashboard/proposals",
    NEW_PROPOSAL: "/admin-dashboard/newProposal",
    VIEW_PROPOSAL: (id = ":id") => `/admin-dashboard/proposal/${id}`,
    UPDATE_PROPOSAL: (id = ":id") => `/admin-dashboard/updateProposal/${id}`,
    // Chat
    CHATS: "/admin-dashboard/chats",
  },
  USER: {
    DASHBOARD: "/user-dashboard",
    HOME: "/user-dashboard/home",
    SERVICE_DESK: "/user-dashboard/serviceDesk",
    SUBSCRIPTIONS: "/user-dashboard/subscriptions",
    SUBSCRIPTION_DETAILS: (id = ":id") => `/user-dashboard/subscription/${id}`,
    NEW_TICKET: "/user-dashboard/newTicket",
    VIEW_TICKET: (id = ":id") => `/user-dashboard/${id}`,
    PAY_METHOD: "/user-dashboard/paymethod",
    NEW_PAY_METHOD: "/user-dashboard/newpaymethod",
    EDIT_PAY_METHOD: (id = ":id") => `/user-dashboard/editpaymethod/${id}`,
    EDIT_USER_PROFILE: (id = ":id") => `/user-dashboard/edituserprofile/${id}`,
    USER_CHATS: "/user-dashboard/chat",
    CLIENT_PROFILE: "/user-dashboard/profile",
  },
  NOT_FOUND: "*",
};
