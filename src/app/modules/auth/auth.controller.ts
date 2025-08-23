/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { catchAsync } from '../../utils/catchAsync'
import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status-codes'
import { sendResponse } from '../../utils/sendresponse'
import { AuthServices } from './auth.service'
import AppError from '../../errorhelpers/AppError'
import { setAuthCookie } from '../../utils/setCookie'
import { JwtPayload } from 'jsonwebtoken'
import { envVars } from '../../config/env'
import { createUserTokens } from '../../utils/userTokens'
import passport from 'passport'

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body)

    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) {
        return next(new AppError(401, err))
      }

      if (!user) {
        // console.log("from !user");
        return next(new AppError(401, info.message))
      }

      const userTokens = createUserTokens(user)

      // delete user.toObject().password
      const { password: pass, ...rest } = user.toObject()

      setAuthCookie(res, userTokens)

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Logged In Successfully',
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      })
    })(req, res, next)
  }
)
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No refresh token recieved from cookies'
      )
    }

    const tokenInfo = await AuthServices.getNewAccessToken(
      refreshToken as string
    )

    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'New Access Token Retrived Successfully',
      data: tokenInfo,
    })
  }
)

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    })

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User logged out Successfully',
      data: null,
    })
  }
)

const restPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword

    const oldPassword = req.body.oldPassword

    const decodedToken = req.user

    const newUpdatedPassword = await AuthServices.resetPassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload
    )

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password changed Successfully',
      data: null,
    })
  }
)

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : ''

    if (redirectTo.startsWith('/')) {
      redirectTo = redirectTo.slice(1)
    }

    // /booking => booking , => "/" => ""
    const user = req.user

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User Not Found')
    }

    const tokenInfo = createUserTokens(user)

    setAuthCookie(res, tokenInfo)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: "Password Changed Successfully",
    //     data: null,
    // })

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
  }
)

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  restPassword,
  googleCallbackController,
}
