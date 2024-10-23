/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as AuthedImport } from './routes/_authed'
import { Route as AuthedIndexImport } from './routes/_authed/index'
import { Route as AuthedRoomsIndexImport } from './routes/_authed/rooms/index'
import { Route as AuthedBookingsIndexImport } from './routes/_authed/bookings/index'
import { Route as AuthedRoomsRoomIdImport } from './routes/_authed/rooms/$roomId'
import { Route as AuthedBookingsBookingIdImport } from './routes/_authed/bookings/$bookingId'

// Create/Update Routes

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const AuthedRoute = AuthedImport.update({
  id: '/_authed',
  getParentRoute: () => rootRoute,
} as any)

const AuthedIndexRoute = AuthedIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedRoomsIndexRoute = AuthedRoomsIndexImport.update({
  id: '/rooms/',
  path: '/rooms/',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedBookingsIndexRoute = AuthedBookingsIndexImport.update({
  id: '/bookings/',
  path: '/bookings/',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedRoomsRoomIdRoute = AuthedRoomsRoomIdImport.update({
  id: '/rooms/$roomId',
  path: '/rooms/$roomId',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedBookingsBookingIdRoute = AuthedBookingsBookingIdImport.update({
  id: '/bookings/$bookingId',
  path: '/bookings/$bookingId',
  getParentRoute: () => AuthedRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authed': {
      id: '/_authed'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthedImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/_authed/': {
      id: '/_authed/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AuthedIndexImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/bookings/$bookingId': {
      id: '/_authed/bookings/$bookingId'
      path: '/bookings/$bookingId'
      fullPath: '/bookings/$bookingId'
      preLoaderRoute: typeof AuthedBookingsBookingIdImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/rooms/$roomId': {
      id: '/_authed/rooms/$roomId'
      path: '/rooms/$roomId'
      fullPath: '/rooms/$roomId'
      preLoaderRoute: typeof AuthedRoomsRoomIdImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/bookings/': {
      id: '/_authed/bookings/'
      path: '/bookings'
      fullPath: '/bookings'
      preLoaderRoute: typeof AuthedBookingsIndexImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/rooms/': {
      id: '/_authed/rooms/'
      path: '/rooms'
      fullPath: '/rooms'
      preLoaderRoute: typeof AuthedRoomsIndexImport
      parentRoute: typeof AuthedImport
    }
  }
}

// Create and export the route tree

interface AuthedRouteChildren {
  AuthedIndexRoute: typeof AuthedIndexRoute
  AuthedBookingsBookingIdRoute: typeof AuthedBookingsBookingIdRoute
  AuthedRoomsRoomIdRoute: typeof AuthedRoomsRoomIdRoute
  AuthedBookingsIndexRoute: typeof AuthedBookingsIndexRoute
  AuthedRoomsIndexRoute: typeof AuthedRoomsIndexRoute
}

const AuthedRouteChildren: AuthedRouteChildren = {
  AuthedIndexRoute: AuthedIndexRoute,
  AuthedBookingsBookingIdRoute: AuthedBookingsBookingIdRoute,
  AuthedRoomsRoomIdRoute: AuthedRoomsRoomIdRoute,
  AuthedBookingsIndexRoute: AuthedBookingsIndexRoute,
  AuthedRoomsIndexRoute: AuthedRoomsIndexRoute,
}

const AuthedRouteWithChildren =
  AuthedRoute._addFileChildren(AuthedRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof AuthedRouteWithChildren
  '/login': typeof LoginRoute
  '/': typeof AuthedIndexRoute
  '/bookings/$bookingId': typeof AuthedBookingsBookingIdRoute
  '/rooms/$roomId': typeof AuthedRoomsRoomIdRoute
  '/bookings': typeof AuthedBookingsIndexRoute
  '/rooms': typeof AuthedRoomsIndexRoute
}

export interface FileRoutesByTo {
  '/login': typeof LoginRoute
  '/': typeof AuthedIndexRoute
  '/bookings/$bookingId': typeof AuthedBookingsBookingIdRoute
  '/rooms/$roomId': typeof AuthedRoomsRoomIdRoute
  '/bookings': typeof AuthedBookingsIndexRoute
  '/rooms': typeof AuthedRoomsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_authed': typeof AuthedRouteWithChildren
  '/login': typeof LoginRoute
  '/_authed/': typeof AuthedIndexRoute
  '/_authed/bookings/$bookingId': typeof AuthedBookingsBookingIdRoute
  '/_authed/rooms/$roomId': typeof AuthedRoomsRoomIdRoute
  '/_authed/bookings/': typeof AuthedBookingsIndexRoute
  '/_authed/rooms/': typeof AuthedRoomsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/login'
    | '/'
    | '/bookings/$bookingId'
    | '/rooms/$roomId'
    | '/bookings'
    | '/rooms'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/login'
    | '/'
    | '/bookings/$bookingId'
    | '/rooms/$roomId'
    | '/bookings'
    | '/rooms'
  id:
    | '__root__'
    | '/_authed'
    | '/login'
    | '/_authed/'
    | '/_authed/bookings/$bookingId'
    | '/_authed/rooms/$roomId'
    | '/_authed/bookings/'
    | '/_authed/rooms/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AuthedRoute: typeof AuthedRouteWithChildren
  LoginRoute: typeof LoginRoute
}

const rootRouteChildren: RootRouteChildren = {
  AuthedRoute: AuthedRouteWithChildren,
  LoginRoute: LoginRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_authed",
        "/login"
      ]
    },
    "/_authed": {
      "filePath": "_authed.tsx",
      "children": [
        "/_authed/",
        "/_authed/bookings/$bookingId",
        "/_authed/rooms/$roomId",
        "/_authed/bookings/",
        "/_authed/rooms/"
      ]
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/_authed/": {
      "filePath": "_authed/index.tsx",
      "parent": "/_authed"
    },
    "/_authed/bookings/$bookingId": {
      "filePath": "_authed/bookings/$bookingId.tsx",
      "parent": "/_authed"
    },
    "/_authed/rooms/$roomId": {
      "filePath": "_authed/rooms/$roomId.tsx",
      "parent": "/_authed"
    },
    "/_authed/bookings/": {
      "filePath": "_authed/bookings/index.tsx",
      "parent": "/_authed"
    },
    "/_authed/rooms/": {
      "filePath": "_authed/rooms/index.tsx",
      "parent": "/_authed"
    }
  }
}
ROUTE_MANIFEST_END */
