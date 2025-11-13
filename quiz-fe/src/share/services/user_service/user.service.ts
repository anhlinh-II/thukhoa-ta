import { BaseService } from "../BaseService";
import { ENV } from '../../config/env';
import { User, UserRequest, UserView } from "./models";
import { UserResponse } from "../authService";

export class UserService extends BaseService<
User,
UserRequest,
UserResponse,
UserView
> {
     constructor() {
          super(ENV.API_URL, 'users');
     }
}

export const userService = new UserService();