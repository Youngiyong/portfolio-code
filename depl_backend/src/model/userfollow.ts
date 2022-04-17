import { getConnection, getRepository } from 'typeorm';
import Database from '../database';
import User from '../entity/User'
import UserFollow from '../entity/UserFollow';
import { DeplResponse, DeplMsgResponse } from '../lib/response';

export async function createUserFollow(event: any, user_id: string){
    const connection = new Database();
    await connection.getConnection();

    const payload = JSON.parse(event.body)
    console.log(payload, user_id)
    try {
        const userRepo = getRepository(User)
        const user = await userRepo.findOne({
            where: {
                id: user_id
            }
        })
        console.log(user)
    
        if(!user) {
            return DeplMsgResponse(400, "존재하지 않는 사용자입니다.")         
        }

        const userFollowRepo = getRepository(UserFollow)
        const userFollow = await userFollowRepo.findOne({
            where: {
                fk_user_id: user_id,
                fk_follow_user_id: payload.follow_user_id
            }
        })
        console.log(userFollow)
        if(userFollow) return DeplMsgResponse(400, "이미 팔로우한 사용자입니다.")

        const follow = new UserFollow()
        follow.fk_user_id = user_id
        follow.fk_follow_user_id = payload.follow_user_id

        await userFollowRepo.save(follow)
        return DeplMsgResponse(200, "OK")
    } catch(e){
        console.error(e)
        throw new Error("Internal Server Error")
    }
}

export async function deleteUserFollow(event: any, user_id: string){
    const connection = new Database();
    await connection.getConnection();

    const follow_user_id = event.pathParameters
    console.log(event)
    console.log("user_follow_id", follow_user_id)
    try {
        const userRepo = getRepository(User)
        const user = await userRepo.findOne({
            where: {
                id: user_id
            }
        })
        if(!user) return DeplMsgResponse(400, "존재하지 않는 사용자입니다.")         

        const userFollowRepo = getRepository(UserFollow)
        const userFollow = await userFollowRepo.findOne({
            where: {
                fk_follow_user_id:follow_user_id.user_id,
                fk_user_id: user_id,
            }
        })
        console.log(userFollow)
        if(userFollow) {
            userFollowRepo.remove(userFollow)
            return DeplMsgResponse(200, "OK")
        }
        else {
            return DeplMsgResponse(400, "팔로우한 사용자가 존재하지 않습니다.")
        }

    } catch(e){
        console.error(e)
        throw new Error("Internal Server Error")
    }
}

export async function getUserFollowers(event: any){
    const connection = new Database();
    await connection.getConnection();

    const payload = event.pathParameters
    try {
        const userRepo = getRepository(User)
        const user = await userRepo.findOne({
            where: {
                id: payload.user_id
            }
        })
        if(!user) return DeplMsgResponse(400, "존재하지 않는 사용자입니다.")         

        const userFollow = await getRepository(UserFollow)
                          .createQueryBuilder("user_follow")
                          .innerJoinAndSelect('user_follow.follower_user','user')
                          .innerJoinAndSelect('user.profile', 'profile')
                          .where('user_follow.fk_follow_user_id = :fk_user_id', { fk_user_id: payload.user_id} )
                          .getMany();

        return DeplResponse(200, userFollow)

    } catch(e){
        console.error(e)
        throw new Error("Internal Server Error")
    }
}

export async function getUserFollows(event: any){
    const connection = new Database();
    await connection.getConnection();

    const payload = event.pathParameters
    try {
        const userRepo = getRepository(User)
        const user = await userRepo.findOne({
            where: {
                id: payload.user_id
            }
        })
        if(!user) return DeplMsgResponse(400, "존재하지 않는 사용자입니다.")         

        const userFollow = await getRepository(UserFollow)
                          .createQueryBuilder("user_follow")
                          .innerJoinAndSelect('user_follow.follow_user','user')
                          .innerJoinAndSelect('user.profile', 'profile')
                          .where('user_follow.fk_user_id = :fk_user_id', { fk_user_id: payload.user_id} )
                          .getMany();

        console.log("??",userFollow)
        return DeplResponse(200, userFollow)

    } catch(e){
        console.error(e)
        throw new Error("Internal Server Error")
    }
}