// src/constants/routeNames.js
// Auth Routes
export const LOGIN = "/login";
export const REGISTER = "/register";

// Dashboard Routes
export const ADMIN_DASHBOARD = "/admin-dashboard";

// Admin Sub-Routes
export const HOME = `${ADMIN_DASHBOARD}/home`;
export const TICKETS = `${ADMIN_DASHBOARD}/tickets`;
export const TICKETS_VIEW = `${ADMIN_DASHBOARD}/tickets/:id`;
export const CATEGORYS = `${ADMIN_DASHBOARD}/categories`;
export const ACCOUNT_MANAGER = `${ADMIN_DASHBOARD}/accountmanager`;
// export const CLIENT_PROFILE = `${ADMIN_DASHBOARD}/clientprofile`
// Proposal template management
export const NEW_PROPOSAL_TEMPLATE = `${ADMIN_DASHBOARD}/newproposaltemplete`;
export const PROPOSAL_TEMPLATES = `${ADMIN_DASHBOARD}/proposaltempletes`;
export const UPDATE_PROPOSAL_TEMPLATE = `${ADMIN_DASHBOARD}/updateproposaltemplete/:id`;
export const VIEW_PROPOSAL_TEMPLATE = `${ADMIN_DASHBOARD}/viewproposaltemplete/:id`;

// User Management
export const NEW_USER = `${ADMIN_DASHBOARD}/newuser`;
export const ALL_USERS = `${ADMIN_DASHBOARD}/allusers`;
export const VIEW_USER = `${ADMIN_DASHBOARD}/view/:id`;
export const UPDATE_USER = `${ADMIN_DASHBOARD}/update`;

// Product Management
export const ALL_PRODUCTS = `${ADMIN_DASHBOARD}/products`;
export const NEW_PRODUCT = `${ADMIN_DASHBOARD}/newproduct`;
export const VIEW_PRODUCT = `${ADMIN_DASHBOARD}/viewproduct/:id`;
export const UPDATE_PRODUCT = `${ADMIN_DASHBOARD}/updateproduct/:id`;

// Order Management
export const NEW_SUBCRIPTIONS = `${ADMIN_DASHBOARD}/newSubscriptions`;
export const ALL_SUBCRIPTIONS = `${ADMIN_DASHBOARD}/subscriptions`;
export const VIEW_SUBCRIPTION = `${ADMIN_DASHBOARD}/subscription/:id`;
// export const UPDATE_ORDER = `${ADMIN_DASHBOARD}/orders/update/:id`;

// Email Template Management
export const NEW_EMAILTEMPLATE = `${ADMIN_DASHBOARD}/newEmail-template`;
export const ALL_EMAILTEMPLATES = `${ADMIN_DASHBOARD}/email-templates`;
export const VIEW_EMAILTEMPLATE = `${ADMIN_DASHBOARD}/email-template/:id`;
export const UPDATE_EMAILTEMPLATE = `${ADMIN_DASHBOARD}/update-email-template/:id`;

// Proposal Routes
export const ALL_PROPOSALS = `${ADMIN_DASHBOARD}/proposals`;
export const NEW_PROPOSAL = `${ADMIN_DASHBOARD}/newProposal`;
export const VIEW_PROPOSAL = `${ADMIN_DASHBOARD}/proposal/:id`;

//Proposal Management
export const UPDATE_PROPOSAL = `${ADMIN_DASHBOARD}/updateProposal/:id`;
// export const PROPOSALS = `${ADMIN_DASHBOARD}/proposals`;

// Chat Routes
export const CHATS = `${ADMIN_DASHBOARD}/chats`;
// Client Routes (if any other than dashboard can be added here)
// e.g. export const CLIENT_PROFILE = '/user-dashboard/profile';

// Fallback/NotFound Route
export const NOT_FOUND = "*";

export const USER_DASHBOARD = "/user-dashboard";
export const USER_HOME = `${USER_DASHBOARD}/home`;

export const SERVICE_DESK = `${USER_DASHBOARD}/serviceDesk`;
// SUBSCRIPTIONS
export const SUBSCRIPTIONS = `${USER_DASHBOARD}/subscriptions`;
export const SUBSCRIPTION_DETAILS = `${USER_DASHBOARD}/subscription`;

// TICKET
export const NEW_TICKET = `${USER_DASHBOARD}/newTicket`;
export const VIEW_TICKET = `${USER_DASHBOARD}/:id`;
export const PAY_METHOD = `${USER_DASHBOARD}/paymethod`;
export const NEW_PAY_METHOD = `${USER_DASHBOARD}/newpaymethod`;
export const EDIT_PAY_METHOD = `${USER_DASHBOARD}/editpaymethod`;
export const EDIT_USER_PROFILE = `${USER_DASHBOARD}/edituserprofile`;
export const USER_CHATS = `${USER_DASHBOARD}/chat`;
export const USER_LOGIN_FORMALITY = `${USER_DASHBOARD}/formalities`;
