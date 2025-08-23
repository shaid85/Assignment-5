import { Router } from 'express'
import { userRoutes } from '../modules/user/user.route'
import { AuthRouters } from '../modules/auth/auth.route'

export const router = Router()

const moduleRoutes = [
  {
    path: '/user',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: AuthRouters,
  },
]

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route)
})
