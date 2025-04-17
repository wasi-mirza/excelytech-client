import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ROUTES } from "./shared/utils/routes.js";

// Login Routes
import { Login } from "./screens/auth/login";
import NewRegistration from "./screens/auth/NewRegistration.js";
import ForgotPassword from "./screens/auth/ForgotPassword.js";

// Admin Routes
import AdminLayout from "./screens/admin/particals/AdminLayout";
import Proposals from "./screens/admin/proposal/Proposals";

import ClientDashboard from "./screens/client/ClientDashboard";
import Register from "./screens/admin/user/NewUser";
import ViewProduct from "./screens/admin/product/ViewProduct";
import Products from "./screens/admin/product/Products";
import Users from "./screens/admin/user/Users";
import UpdateForm from "./screens/admin/user/UpdateUser";
import View from "./screens/admin/user/UserDetails";
import Proposaltemplete from "./screens/admin/proposalTemplate/Proposaltemplete";
import NewProposalTemplete from "./screens/admin/proposalTemplate/NewProposalTemplate";
import UpdateProposalTemplate from "./screens/admin/proposalTemplate/UpdateProposalTemplate";
import ViewProposalTemplete from "./screens/admin/proposalTemplate/ViewProposalTemplete";
import NewProduct from "./screens/admin/product/NewProduct";
import UserLayout from "./screens/client/UserLayout";
import GetProposal from "./screens/client/proposals/GetProposal";
import ProposalInfo from "./screens/client/proposals/ProposalInfo";
import UpdateProduct from "./screens/admin/product/updateProduct";
import AdminHome from "./screens/admin/home/home.js";
import Category from "./screens/admin/Category/Category";
import NewProposal from "./screens/admin/proposal/NewProposal";
import Chat from "./screens/chats/Chat.js";
import ServiceDesk from "./screens/client/serviceDesk/ServiceDesk";
import CreateTicket from "./screens/client/serviceDesk/NewTicket";
import ClientHome from "./screens/client/clientHome/ClientHome.js";
import ViewTicket from "./screens/client/serviceDesk/ViewTicket.js";
import Tickets from "./screens/admin/Ticket/Tickets.js";
import ViewTecket from "./screens/admin/Ticket/ViewTicket.js";
import Subscriptions from "./screens/admin/subscription/Subscriptions.js";
import SubscriptionDetails from "./screens/admin/subscription/SubscriptionsDetails.js";
import ProposalDetails from "./screens/admin/proposal/ProposalDetails.js";
import SubscriptionsbyUser from "./screens/client/Subscription/SubscriptionsbyUser.js";
import ChatSidebar from "./screens/chats/ChatSidebar.js";
import UserProfile from "./screens/client/UserProfile.js";
import PaymentMethods from "./screens/client/PaymentMethod/PaymentMethod.js";
import NewSubscription from "./screens/admin/subscription/NewSubscription.js";
import AddPaymentMethod from "./screens/client/PaymentMethod/NewPaymentMethod.js";
import EditPaymentMethod from "./screens/client/PaymentMethod/EditPaymentMethod.js";
import EditUserProfile from "./screens/client/EditUserProfile.js";
import ClientSubscriptionDetails from "./screens/client/Subscription/ClientSubscriptionDetails.js";
import EmailTemplates from "./screens/admin/emailTemplates/EmailTemplates.js";
import InactivityLogout from "./inactivity_logout.js"; // Import the InactivityLogout Component
import { useAuth } from "./context/AuthContext"; // Import useAuth
import { Navigate } from "react-router-dom";
import NewEmailTemplate from "./screens/admin/emailTemplates/NewEmailTemplate.js";
import ViewEmailTemplate from "./screens/admin/emailTemplates/ViewEmailTemplate.js";
import UpdateEmailTemplate from "./screens/admin/proposalTemplate/UpdateProposalTemplate";

function App() {
  const router = createBrowserRouter([
    { path: ROUTES.AUTH.LOGIN, element: <Login /> },
    { path: ROUTES.AUTH.FORMALITY, element: <NewRegistration /> },
    {
      path: ROUTES.USER.DASHBOARD.replace("/user-dashboard", "user-dashboard"),
      element: (
        <>
          <UserLayout />
          <InactivityLogout />
        </>
      ),
      children: [
        {
          path: ROUTES.USER.HOME,
          element: <ClientHome />,
        },
        {
          path: "proposal",
          element: <GetProposal />,
        },
        {
          path: "proposal-view",
          element: <ProposalInfo />,
        },
        //ServiceDesk
        {
          path: ROUTES.USER.SERVICE_DESK,
          element: <ServiceDesk />,
        },
        {
          path: ROUTES.USER.SUBSCRIPTIONS,
          element: <SubscriptionsbyUser />,
        },
        {
          path: ROUTES.USER.SUBSCRIPTION_DETAILS(":id"),
          element: <ClientSubscriptionDetails />,
        },
        {
          path: ROUTES.USER.NEW_TICKET,
          element: <CreateTicket />,
        },
        {
          path: ROUTES.USER.VIEW_TICKET(":id"),
          element: <ViewTicket />,
        },
        {
          path: ROUTES.USER.USER_CHATS,
          element: <ChatSidebar />,
        },
        {
          path: "paymethod",
          element: <PaymentMethods />,
        },
        {
          path: "newpaymethod",
          element: <AddPaymentMethod />,
        },
        {
          path: ROUTES.USER.EDIT_PAY_METHOD(":id"),
          element: <EditPaymentMethod />,
        },
        {
          path: ROUTES.USER.EDIT_USER_PROFILE(":id"),
          element: <EditUserProfile />,
        },
        {
          path: "clientprofile",
          element: <UserProfile />,
        },
      ],
    },

    {
      path: ROUTES.ADMIN.DASHBOARD.replace("/admin-dashboard", "admin-dashboard"),
      element: (
        <>
          <AdminLayout />
          <InactivityLogout />
        </>
      ),
      children: [
        //home
        { path: ROUTES.ADMIN.HOME, element: <AdminHome /> },

        //Subscriptions
        { path: ROUTES.ADMIN.NEW_SUBSCRIPTION, element: <NewSubscription /> },
        { path: ROUTES.ADMIN.ALL_SUBSCRIPTIONS, element: <Subscriptions /> },
        {
          path: ROUTES.ADMIN.VIEW_SUBSCRIPTION(":id"),
          element: <SubscriptionDetails />,
        },

        //Proposals
        { path: ROUTES.ADMIN.ALL_PROPOSALS, element: <Proposals /> },
        { path: ROUTES.ADMIN.NEW_PROPOSAL, element: <NewProposal /> },
        {
          path: ROUTES.ADMIN.VIEW_PROPOSAL(":id"),
          element: <ProposalDetails />,
        },

        //Category
        { path: ROUTES.ADMIN.CATEGORIES, element: <Category /> },
        { path: ROUTES.ADMIN.TICKETS, element: <Tickets /> },
        { path: ROUTES.ADMIN.TICKET_VIEW(":id"), element: <ViewTecket /> },
        {
          path: ROUTES.ADMIN.NEW_PROPOSAL_TEMPLATE,
          element: <NewProposalTemplete />,
        },
        { path: ROUTES.ADMIN.PROPOSAL_TEMPLATES, element: <Proposaltemplete /> },
        {
          path: ROUTES.ADMIN.UPDATE_PROPOSAL_TEMPLATE(":id"),
          element: <UpdateProposalTemplate />,
        },
        {
          path: ROUTES.ADMIN.VIEW_PROPOSAL_TEMPLATE(":id"),
          element: <ViewProposalTemplete />,
        },

        //Client
        { path: ROUTES.ADMIN.NEW_USER, element: <Register /> },
        { path: ROUTES.ADMIN.ALL_USERS, element: <Users /> },
        { path: ROUTES.ADMIN.VIEW_USER(":id"), element: <View /> },
        { path: ROUTES.ADMIN.UPDATE_USER(":id"), element: <UpdateForm /> },

        //Email templates
        { path: ROUTES.ADMIN.NEW_EMAIL_TEMPLATE, element: <NewEmailTemplate /> },
        { path: ROUTES.ADMIN.ALL_EMAIL_TEMPLATES, element: <EmailTemplates /> },
        {
          path: ROUTES.ADMIN.VIEW_EMAIL_TEMPLATE(":id"),
          element: <ViewEmailTemplate />,
        },
        {
          path: ROUTES.ADMIN.UPDATE_EMAIL_TEMPLATE(":id"),
          element: <UpdateEmailTemplate />,
        },

        //Products
        { path: ROUTES.ADMIN.NEW_PRODUCT, element: <NewProduct /> },
        { path: ROUTES.ADMIN.ALL_PRODUCTS, element: <Products /> },
        { path: ROUTES.ADMIN.VIEW_PRODUCT(":id"), element: <ViewProduct /> },
        { path: ROUTES.ADMIN.UPDATE_PRODUCT(":id"), element: <UpdateProduct /> },

        //Chat
        { path: ROUTES.ADMIN.CHATS, element: <Chat /> },
      ],
    },
    { path: ROUTES.NOT_FOUND, element: <Login /> }, // Fallback for unmatched routes
  ]);

  return <RouterProvider router={router} />;
}

export default App;
