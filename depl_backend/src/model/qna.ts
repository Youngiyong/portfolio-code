import Database, { connectDatabase } from '../database';
import { getConnection, getRepository } from 'typeorm';
import Qna from '../entity/Qnas';
import QnaAggregation from '../entity/QnaAggregation';
import QnaComment from '../entity/QnaComment';
import QnaLike from '../entity/QnaLike';
import QnaTag from '../entity/QnaTag';
import { DeplResponse, DeplMsgResponse } from '../lib/response';
import Tag from '../entity/Tag';
import User from '../entity/User';


export const postQnaLike = async (event: any, user_id: string) => {
    const connection = new Database();
    await connection.getConnection();
    
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();

    const payload = JSON.parse(event.body);
    try {
        //Qna Like Check
        const qnaLikeRepo = getRepository(QnaLike)
        const qnaAggreRepo = getRepository(QnaAggregation)
        const qnaLike = await qnaLikeRepo.findOne({
            where: {
                fk_qna_id: payload.qna_id,
                fk_user_id: user_id
            },
        })

        if(qnaLike) return DeplMsgResponse(400, "이미 좋아요한 QNA입니다.")

        const newQnaLike = new QnaLike();
        console.log(payload.qna_id, user_id)
        newQnaLike.fk_qna_id = payload.qna_id
        newQnaLike.fk_user_id = user_id

        await queryRunner.manager.save(newQnaLike)

        const qnaAggre = await qnaAggreRepo.findOne({
            where: {
                fk_qna_id: payload.qna_id,
            },
        })

        qnaAggre.likes += 1
        await queryRunner.manager.save(qnaAggre)

        await queryRunner.commitTransaction();
        return DeplMsgResponse(200, "OK")

      } catch (e) {
        await queryRunner.rollbackTransaction();
        throw new Error("Invalid Error Message:"+ e)
      } finally {
          await queryRunner.release();
      }

} 



export const deleteQnaLike = async (event: any, user_id: string) => {
    const connection = new Database();
    await connection.getConnection();
    
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();

    const pathParam = event.pathParameters

    try {
        const qnaRepo = getRepository(Qna)
        const qna = await qnaRepo.findOne({
            where: {
                id: pathParam.qna_id,
                deleted_at: null
            },
        })
        if(!qna) return DeplMsgResponse(404, "삭제되었거나 존재하지 않는 QNA입니다")
        console.log(qna)

        //Qna Like Check
        const qnaLikeRepo = getRepository(QnaLike)
        const qnaAggreRepo = getRepository(QnaAggregation)
        const qnaLike = await qnaLikeRepo.findOne({
            where: {
                fk_qna_id: pathParam.qna_id,
                fk_user_id: user_id
            },
        })

        if(!qnaLike) return DeplMsgResponse(404, "QNA 좋아요하지 않은 게시글입니다")
        
        await queryRunner.manager.remove(qnaLike)

        const qnaAggre = await qnaAggreRepo.findOne({
            where: {
                fk_qna_id: pathParam.qna_id,
            },
        })

        qnaAggre.likes -= 1

        await queryRunner.manager.save(qnaAggre);

        await queryRunner.commitTransaction();
        return DeplMsgResponse(200, "OK")

      } catch (e) {
        await queryRunner.rollbackTransaction();
        throw new Error("Invalid Error Message:"+ e)
      } finally {
          await queryRunner.release();
      }


} 


export const updateQnaViewCount = async (event: any) => {
    await connectDatabase();
    const pathParam = event.pathParameters

    try {
        const qnaRepo = getRepository(Qna)
        const qna = await qnaRepo.findOne({
            where: {
                id: pathParam.qna_id,
                deleted_at: null
            },
        })
        if(!qna) return DeplMsgResponse(404, "삭제되었거나 존재하지 않는 QNA입니다")
        console.log(qna)

        //Qna User Check
        const qnaAggreRepo = getRepository(QnaAggregation)
        const qnaAggre = await qnaAggreRepo.findOne({
            where: {
                fk_qna_id: pathParam.qna_id
            },
        })

        if(!qnaAggre) return DeplMsgResponse(404, "존재하지 않는 QNA입니다.")

        qnaAggre.updated_at = new Date();
        qnaAggre.views += 1
        
        await qnaAggreRepo.save(qnaAggre)

        return DeplMsgResponse(200, "OK")
    } catch (e) {
      console.error(e)
    }

} 

export const updateQna = async (event: any, user_id: string) => {
    
    const connection = new Database();
    await connection.getConnection();
    
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();

    const payload = JSON.parse(event.body);
    const pathParam = event.pathParameters
    try {
        //Qna User Check
        const qnaRepo = getRepository(Qna)
        const tagRepo = getRepository(Tag)
        const qna = await qnaRepo.findOne({
            where: {
                id: pathParam.qna_id,
                fk_user_id: user_id
            },
        })
        if(!qna) return DeplMsgResponse(400, "Invalid Request Error")


        for (const [key, value] of Object.entries(payload)) {
            
            switch(key){
                case 'create_tags':
                    for (const element of payload.create_tags) {
                        console.log(element)

                        const tag = await tagRepo.findOne({
                            where: {
                            name: element
                            },
                        })


                        const qnaTag = new QnaTag();

                        if(!tag){
                            const newTag =  new Tag()
                            newTag.name = element
                            await queryRunner.manager.save(newTag)
                            
                            qnaTag.fk_qna_id = qna.id
                            qnaTag.fk_tag_id = newTag.id
                            await queryRunner.manager.save(qnaTag)
        
                        } else {
                            qnaTag.fk_qna_id = qna.id
                            qnaTag.fk_tag_id = tag.id
                            console.log("qnaTag", qnaTag)
                            await queryRunner.manager.save(qnaTag)
                        }
                    }

                    break;

                case 'delete_tags':
                    const qnaTagRepo = getRepository(QnaTag)
                    for (const element of payload.delete_tags) {
                        const qnaTag = await qnaTagRepo.findOne({
                            where: {
                            id: element
                            },
                        })
                        console.log(qnaTag)
                        await queryRunner.manager.remove(qnaTag)
                    }
                    break;

                default : 
                    qna[key] = value;
                    break;
            }


        }

        qna.updated_at = new Date();
        await queryRunner.manager.save(qna)
        await queryRunner.commitTransaction();
        return DeplMsgResponse(200, "OK")

      } catch (e) {
        await queryRunner.rollbackTransaction();
        throw new Error("Invalid Error Message:"+ e)
      } finally {
          await queryRunner.release();
      }
}


export const deleteQna = async (event: any, user_id: string) => {
    await connectDatabase();
    const pathParam = event.pathParameters

    try {
        //Qna User Check
        const qnaRepo = getRepository(Qna)
        const qna = await qnaRepo.findOne({
            where: {
                id: pathParam.qna_id,
                fk_user_id: user_id
            },
        })
        if(!qna) return DeplMsgResponse(400, "Invalid Request Error")
        console.log(qna)
        qna.updated_at = new Date();
        qna.deleted_at = new Date();

        await qnaRepo.save(qna)

        return DeplMsgResponse(200, "OK")
    } catch (e) {
      console.error(e);
    }
}

export const postQna = async (event: any, user_id: string) => {
    const connection = new Database();
    await connection.getConnection();
    
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();

    const payload = JSON.parse(event.body);
    
    try {
        const tagRepo = getRepository(Tag);

        const qna = new Qna();
        qna.fk_user_id = user_id
        qna.title = payload.title
        qna.text = payload.text
        qna.is_markdown = payload.is_markdown ? payload.is_markdown : false
        qna.is_temp = payload.is_temp ? payload.is_temp : false
        qna.is_private = payload.is_private ? payload.is_private : false

        await queryRunner.manager.save(qna);
        console.log("qna", qna)
        const qnaAggregation = new QnaAggregation();
        qnaAggregation.fk_qna_id = qna.id
        
        await queryRunner.manager.save(qnaAggregation);
        console.log("qnaAggre", qnaAggregation)
        // tags 목록이 있는지 체크
        if(payload.tags){
            for (const element of payload.tags) {
                console.log(element);

                const tag = await tagRepo.findOne({
                    where: {
                    name: element
                    },
                })

                const qnaTag = new QnaTag();

                if(!tag){
                    const newTag =  new Tag()
                    newTag.name = element
                    await queryRunner.manager.save(newTag)
                    
                    qnaTag.fk_qna_id = qna.id
                    qnaTag.fk_tag_id = newTag.id
                    await queryRunner.manager.save(qnaTag)

                } else {
                    qnaTag.fk_qna_id = qna.id
                    qnaTag.fk_tag_id = tag.id
                    console.log("qnaTag", qnaTag)
                    await queryRunner.manager.save(qnaTag)
                }

            }
        }
        await queryRunner.commitTransaction();

        return DeplMsgResponse(200, "OK")

    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new Error("Invalid Error Message:"+ e)
    } finally {
        await queryRunner.release();
    }
}


export const putQnaComment = async (event: any, user_id: string) => {
    await connectDatabase();
    
    const pathParam = event.pathParameters
    const payload = JSON.parse(event.body);
    console.log("33",pathParam, payload)
    try {
        const commentRepo = getRepository(QnaComment)
        const qnaRepo = getRepository(Qna)

        const qna = await qnaRepo.findOne({
            where: {
                id: pathParam.qna_id,
                deleted_at: null
            },
        })
        console.log("qna",qna)

        if(!qna) return DeplMsgResponse(404, "존재하지 않거나 삭제된 QNA입니다.")

        const comment = await commentRepo.findOne({
            where: {
                id : pathParam.comment_id,
                fk_qna_id: pathParam.qna_id,
                fk_user_id: user_id,
                deleted_at: null
            },
        })
        console.log("12",pathParam, payload)
        console.log("3",comment)
        if(!comment) return DeplMsgResponse(404, "존재하지 않거나 삭제된 댓글입니다.")

        comment.text = payload.text
        comment.updated_at = new Date();

        await commentRepo.save(comment);
        return DeplMsgResponse(200, "OK")
    } catch (e) {
        console.error(e)
    }
}

export const getQna = async (event: any) => {
    await connectDatabase();
    
    const pathParam = event.pathParameters
    const qna = await getRepository(Qna)
    .createQueryBuilder("qna")
    .leftJoinAndSelect("qna.user", "user")
    .leftJoinAndSelect("user.profile", "profile")
    .leftJoinAndSelect("qna.aggregations", "aggregations")
    .leftJoinAndSelect("qna.tags", "tags")
    .leftJoinAndSelect("tags.tag", "tag")
    .leftJoinAndSelect("qna.comments", "comments")
    .leftJoinAndSelect("comments.comment_user", "comment_user")
    .leftJoinAndSelect("comment_user.profile", "comment_user_profile")
    .leftJoinAndSelect("qna.likes", "likes")
    .leftJoinAndSelect("likes.user", "likes_user")
    .leftJoinAndSelect("likes_user.profile", "likes_user_profile")
    .where('qna.id = :id', { id: pathParam.qna_id, deleted_at: null })
    .orderBy("comments.created_at", "ASC")
    .getOne();

    if(!qna) return DeplMsgResponse(404, "존재하지 않거나 삭제된 QNA입니다.")

    return DeplResponse(200, qna)
}


export const findAllQna = async (event: any) => {
    await connectDatabase();

    const page = event.queryStringParameters === null || event.queryStringParameters.page === undefined 
                ? 20 : event.queryStringParameters.page
    const qna = await getRepository(Qna)
    .createQueryBuilder("qna")
    .leftJoinAndSelect("qna.user", "user")
    .leftJoinAndSelect("user.profile", "profile")
    .leftJoinAndSelect("qna.aggregations", "aggregations")
    .leftJoinAndSelect("qna.tags", "tags")
    .leftJoinAndSelect("tags.tag", "tag")
    .leftJoinAndSelect("qna.comments", "comments")
    .leftJoinAndSelect("qna.likes", "likes")
    .take(page)
    .where({deleted_at : null})
    .orderBy("qna.created_at", "DESC")
    .getMany();
    if(!qna) return DeplMsgResponse(404, "qna 정보가 없습니다.")
    return DeplResponse(200, qna)
}

export const postQnaComment = async (event: any, user_id: string) => {
    await connectDatabase();
    
    const payload = JSON.parse(event.body);
    try {
        const commentRepo = getRepository(QnaComment)
        const qnaRepo = getRepository(Qna)

        const qna = await qnaRepo.findOne({
            where: {
                id: payload.qna_id,
                deleted_at: null
            },
        })

        if(!qna) return DeplMsgResponse(404, "존재하지 않거나 삭제된 QNA입니다.")

        const qna_comment = new QnaComment();

        qna_comment.fk_qna_id = payload.qna_id
        qna_comment.fk_user_id = user_id
        qna_comment.is_private = payload.is_private ? payload.is_privae : false
        qna_comment.is_reply = payload.is_reply ? payload.is_reply : false
        qna_comment.level = payload.level ? payload.level : 0
        qna_comment.reply_to = payload.reply_to ? payload.reply_to : null
        qna_comment.text = payload.text

        await commentRepo.save(qna_comment);
        
        return DeplMsgResponse(200, "OK")
    } catch (e) {
        console.error(e)
    }
}

export const HardDeleteQnaComment = async (event: any, user_id: string) => {
    await connectDatabase();

    const pathParam = event.pathParameters

    try {
        const commentRepo = getRepository(QnaComment)
        const qnaRepo = getRepository(Qna)

        const qna = await qnaRepo.findOne({
            where: {
                id: pathParam.qna_id,
                deleted_at: null
            },
        })

        if(!qna) return DeplMsgResponse(404, "존재하지 않거나 삭제된 QNA입니다.")

        const comment = await commentRepo.findOne({
            where: {
                id : pathParam.comment_id,
                fk_qna_id: pathParam.qna_id,
                fk_user_id: user_id,
                deleted_at: null
            },
        })
        
        await commentRepo.remove(comment)

        return DeplMsgResponse(200, "OK")
    } catch (e) {
        console.error(e)
    }
}

export const deleteQnaComment = async (event: any, user_id: string) => {
    await connectDatabase();
    
    const pathParam = event.pathParameters

    try {
        const commentRepo = getRepository(QnaComment)
        const qnaRepo = getRepository(Qna)

        const qna = await qnaRepo.findOne({
            where: {
                id: pathParam.qna_id,
                deleted_at: null
            },
        })

        if(!qna) return DeplMsgResponse(404, "존재하지 않거나 삭제된 QNA입니다.")

        const comment = await commentRepo.findOne({
            where: {
                id : pathParam.comment_id,
                fk_qna_id: pathParam.qna_id,
                fk_user_id: user_id,
                deleted_at: null
            },
        })
        console.log(comment)
        if(!comment) return DeplMsgResponse(404, "존재하지 않거나 삭제된 댓글입니다.")

        comment.deleted_at = new Date();
        comment.updated_at = new Date();

        await commentRepo.save(comment);
        return DeplMsgResponse(200, "OK")
    } catch (e) {
        console.error(e)
    }
}