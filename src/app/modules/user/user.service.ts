import AppError from '../../errorhelpers/AppError'
import { IAuthProvider, IUser, Role } from './user.interface'
import { User } from './user.model'
import httpStatus from 'http-status-codes'
import bcriptjs from 'bcryptjs'
import { envVars } from '../../config/env'
import { JwtPayload } from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload

  const isUserExist = await User.findOne({ email })

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already Exist')
  }

  const hashPassword = await bcriptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  )

  const authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email as string,
  }

  const user = await User.create({
    email,
    password: hashPassword,
    auths: [authProvider],
    ...rest,
  })

  return user
}

// ✅ Use Role enum in filter type
interface UserFilter {
  role?: Role
}
export const getAllUsers = async (filter: UserFilter = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {}

  if (filter.role) {
    query.role = filter.role
  }

  const users = await User.find(query)
  const totalUser = await User.countDocuments(query)

  return {
    users,
    meta: {
      total: totalUser,
    },
  }
}

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const ifUserExist = await User.findById(userId)

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User Not Found')
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized')
    }

    // if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized')
    // }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized')
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND
    )
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  })

  return newUpdatedUser
}

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
}
