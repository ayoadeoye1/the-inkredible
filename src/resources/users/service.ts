import User from "../../models/user";
import Account from "../../models/account";
import RedisService from "../../utils/redis";
import { Constants } from "../../config/constants";

export default class UserService {
  public async createUser(data: any) {
    const userData = await User.create(data);
    return userData;
  }

  public async userExist(email: string): Promise<User> {
    const userExist = await User.findOne({
      where: { email },
    });
    return userExist;
  }

  public async userById(id: number): Promise<User> {
    const userExist = await User.findByPk(id);
    return userExist;
  }

  public async findUser(id: number): Promise<User> {
    const user = await RedisService.cacheAndGet(
      Constants.CACHE_USER_PROFILE + `_${String(id)}`,
      async () => {
        let user = await User.findByPk(id, { raw: true });
        const account = await Account.findOne({
          where: {
            userId: id,
          },
          raw: true,
        });
        const { createdAt, updatedAt, authCode, authExp, password, verified, ...userData } = user;
        const { userId, createdAt: accCreate, updatedAt: accUpdate, ...accountData } = account;
        return {
          ...userData,
          account: accountData,
        };
      },
      36000
    );

    return user;
  }

  public async cacheAfterUpdate(id: number): Promise<boolean> {
    const user = await RedisService.updateVal(
      Constants.CACHE_USER_PROFILE + `_${String(id)}`,
      async () => {
        let user = await User.findByPk(id, { raw: true });
        const account = await Account.findOne({
          where: {
            userId: id,
          },
          raw: true,
        });
        const { createdAt, updatedAt, authCode, authExp, password, verified, ...userData } = user;
        const { userId, createdAt: accCreate, updatedAt: accUpdate, ...accountData } = account;
        return {
          ...userData,
          account: accountData,
        };
      },
      36000 //10hrs
    );

    return user;
  }
}
