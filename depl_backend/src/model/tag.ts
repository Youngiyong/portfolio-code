

import Database, { connectDatabase } from '../database';
import { getRepository } from 'typeorm';
import Tag from '../entity/Tag';
import { DeplResponse, DeplMsgResponse } from '../lib/response';
import AdminUser from '../entity/AdminUser';

export const putTag = async (event: any, user_id: string) => {
    await connectDatabase();
    const payload = JSON.parse(event.body);
    const pathParam = event.pathParameters
    console.log(payload);
  
    try {
        //Admin User Check
        const adminRepo = getRepository(AdminUser)
        const admin = await adminRepo.findOne({
            where: {
            fk_user_id: user_id
            },
        })
        if(!admin) DeplMsgResponse(402, "UnAuthorized Admin User")
  
        const tagRepo = getRepository(Tag);
        const tag = await tagRepo.findOne({
            where: {
            id: pathParam.tag_id
            },
        })
        if(!tag) return DeplMsgResponse(404, "존재하지 않느 태그입니다.")
        
        for (const [key, value] of Object.entries(payload)) {
            tag[key] = value;
        }
        tag.updated_at = new Date();
        await tagRepo.save(tag);
  
        return DeplMsgResponse(200, "OK")
    } catch (e) {
      console.error(e);
    }
  };

export const postTag = async (event: any, user_id: string) => {
  await connectDatabase();
  const payload = JSON.parse(event.body);
  console.log(payload);

  try {
    //Admin User Check
    const adminRepo = getRepository(AdminUser)
    const admin = await adminRepo.findOne({
        where: {
          fk_user_id: user_id
        },
      })
    if(!admin) DeplMsgResponse(402, "UnAuthorized Admin User")

    //Tag Exist Check
    const tagRepo = getRepository(Tag);
    const tag = await tagRepo.findOne({
        where: {
        name: payload.name
        },
    })

    if(tag) return DeplMsgResponse(400, "이미 존재하는 태그입니다.")

    const newTag = new Tag();
    newTag.name = payload.name
    newTag.thumbnail = payload.thumbnail
    newTag.description = payload.description

    await tagRepo.save(newTag);

    return DeplMsgResponse(200, "OK")
  } catch (e) {
    console.error(e);
  }
};


export const deleteTag = async (event: any, user_id: string) => {
    await connectDatabase();
    const pathParam = event.pathParameters
  
    try {
        //Admin User Check
        const adminRepo = getRepository(AdminUser)
        const admin = await adminRepo.findOne({
            where: {
            fk_user_id: user_id
            },
        })
        if(!admin) DeplMsgResponse(402, "UnAuthorized Admin User")
        const tagRepo = getRepository(Tag);
        const tag = await tagRepo.findOne({
            where: {
            id: pathParam.tag_id
            },
        })
        console.log(tag);
  
        await tagRepo.remove(tag)
        return DeplMsgResponse(200, "OK")
    } catch (e) {
      console.error(e);
    }
  };

export const getTags = async () => {
  await connectDatabase();

  try {
    const tagRepo = getRepository(Tag);
    const tags = await tagRepo.find()
    console.log(tags);

    if (!tags) return DeplMsgResponse(404, '태그가 없습니다.');

    return DeplResponse(200, tags);
  } catch (e) {
    console.error(e);
  }
};


export const getTag = async (event: any) => {
    await connectDatabase();
    try {
      const tagRepo = getRepository(Tag);
      const tag = await tagRepo.findOne({
        where: {
          id: event.pathParameters.tag_id
        },
      })
      console.log(tag);
      if (!tag) return DeplMsgResponse(404, '존재하지 않는 태그입니다.');
  
      return DeplResponse(200, tag);
    } catch (e) {
      console.error(e);
    }
  };
  
  