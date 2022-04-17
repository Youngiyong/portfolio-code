import Database, { connectDatabase } from '../database';
import { getConnection, getRepository } from 'typeorm';
import Post from '../entity/Post';
import PostLike from '../entity/PostLike';
import PostTag from '../entity/PostTag';
import PostComment from '../entity/PostComment';
import Tag from '../entity/Tag';
import { DeplResponse, DeplMsgResponse } from '../lib/response';

export const writePostLike = async (event: any, user_id: string) => {
  
    const connection = new Database();
    await connection.getConnection();
    
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();
  
  
    const payload = JSON.parse(event.body);
  
  try {

        //Post Check
        const postRepo = getRepository(Post)
        const post = await postRepo.findOne({
              where: {
                  id: payload.post_id,
                  deleted_at: null
            },
      })

      if(!post) return DeplMsgResponse(404, "존재하지 않는 post입니다.")

      //Post Like Check
      const postLikeRepo = getRepository(PostLike)
      const postLike = await postLikeRepo.findOne({
          where: {
              fk_post_id: payload.post_id,
              fk_user_id: user_id
          },
      })

      if(postLike) return DeplMsgResponse(400, "이미 좋아요한 post입니다.")

      const newPostLike = new PostLike();
      console.log(payload.post_id, user_id)
      newPostLike.fk_post_id = payload.post_id
      newPostLike.fk_user_id = user_id

      post.likes_count += 1

      await queryRunner.manager.save(post);
      await queryRunner.manager.save(newPostLike)
      await queryRunner.commitTransaction();
      return DeplMsgResponse(200, "OK")

    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new Error("Invalid Error Message:"+ e)
    } finally {
        await queryRunner.release();
    }

} 



export const deletePostLike = async (event: any, user_id: string) => {
  await connectDatabase();

  const pathParam = event.pathParameters

  try {
      //Post Like Check
      const postLikeRepo = getRepository(PostLike)
      const postLike = await postLikeRepo.findOne({
          where: {
              fk_post_id: pathParam.post_id,
              fk_user_id: user_id
          },
      })

      if(!postLike) return DeplMsgResponse(404, "post 좋아요하지 않은 게시글입니다")
      
      await postLikeRepo.remove(postLike)

      return DeplMsgResponse(200, "OK")

    } catch (e) {
      console.error(e)
    }
} 


export const updatePost = async (event: any, user_id: string) => {
  
  const connection = new Database();
  await connection.getConnection();
  
  const queryRunner = await getConnection().createQueryRunner();
  await queryRunner.startTransaction();

  const payload = JSON.parse(event.body);
  const pathParam = event.pathParameters
  try {
      //Qna User Check
      const postRepo = getRepository(Post)
      const tagRepo = getRepository(Tag)
      const post = await postRepo.findOne({
          where: {
              id: pathParam.post_id,
              fk_user_id: user_id,
              deleted_at: null
          },
      })
      if(!post) return DeplMsgResponse(400, "Invalid Request Error")


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


                      const postTag = new PostTag();

                      if(!tag){
                          const newTag =  new Tag()
                          newTag.name = element
                          await queryRunner.manager.save(newTag)
                          
                          postTag.fk_post_id = post.id
                          postTag.fk_tag_id = newTag.id
                          await queryRunner.manager.save(postTag)
      
                      } else {
                          postTag.fk_post_id = post.id
                          postTag.fk_tag_id = tag.id
                          console.log("postTag", postTag)
                          await queryRunner.manager.save(postTag)
                      }
                  }

                  break;

              case 'delete_tags':
                  const postTagRepo = getRepository(PostTag)
                  for (const element of payload.delete_tags) {
                      const postTag = await postTagRepo.findOne({
                          where: {
                          id: element
                          },
                      })
                      console.log(postTag)
                      await queryRunner.manager.remove(postTag)
                  }
                  break;

              default : 
                  post[key] = value;
                  break;
          }


      }

      post.updated_at = new Date();
      await queryRunner.manager.save(post)
      await queryRunner.commitTransaction();
      return DeplMsgResponse(200, "OK")

    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new Error("Invalid Error Message:"+ e)
    } finally {
        await queryRunner.release();
    }
}


export const deletePost = async (event: any, user_id: string) => {
  await connectDatabase();
  const pathParam = event.pathParameters

  try {
      //Post User Check
      const postRepo = getRepository(Post)
      const post = await postRepo.findOne({
          where: {
              id: pathParam.post_id,
              fk_user_id: user_id,
              deleted_at: null
          },
      })
      if(!post) return DeplMsgResponse(400, "Invalid Request Error")
      console.log(post)
      post.updated_at = new Date();
      post.deleted_at = new Date();

      await postRepo.save(post)

      return DeplMsgResponse(200, "OK")
  } catch (e) {
    console.error(e);
  }
}

export const writePost = async (event: any, user_id: string) => {
  const connection = new Database();
  await connection.getConnection();
  
  const queryRunner = await getConnection().createQueryRunner();
  await queryRunner.startTransaction();

  const payload = JSON.parse(event.body);
  
  try {
      const tagRepo = getRepository(Tag);

      const post = new Post();
      post.fk_user_id = user_id
      post.thumbnail = payload.thumbnail
      post.title = payload.title
      post.text = payload.text
      post.is_markdown = payload.is_markdown ? payload.is_markdown : false
      post.is_temp = payload.is_temp ? payload.is_temp : false
      post.is_private = payload.is_private ? payload.is_private : false

      await queryRunner.manager.save(post);
      console.log("post", post)
      
      // tags 목록이 있는지 체크
      if(payload.tags){
          for (const element of payload.tags) {
              console.log(element);

              const tag = await tagRepo.findOne({
                  where: {
                  name: element
                  },
              })

              const postTag = new PostTag();

              if(!tag){
                  const newTag =  new Tag()
                  newTag.name = element
                  await queryRunner.manager.save(newTag)
                  
                  postTag.fk_post_id = post.id
                  postTag.fk_tag_id = newTag.id
                  await queryRunner.manager.save(postTag)

              } else {
                  postTag.fk_post_id = post.id
                  postTag.fk_tag_id = tag.id
                  console.log("postTag", postTag)
                  await queryRunner.manager.save(postTag)
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


export const putPostComment = async (event: any, user_id: string) => {
  await connectDatabase();
  
  const pathParam = event.pathParameters
  const payload = JSON.parse(event.body);
  console.log("33",pathParam, payload)
  try {
      const commentRepo = getRepository(PostComment)
      const postRepo = getRepository(Post)

      const post = await postRepo.findOne({
          where: {
              id: pathParam.post_id,
              deleted_at: null
          },
      })
      console.log("post", post)

      if(!post) return DeplMsgResponse(404, "존재하지 않거나 삭제된 post입니다.")

      const comment = await commentRepo.findOne({
          where: {
              id : pathParam.comment_id,
              fk_post_id: pathParam.post_id,
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

export const findAllPost = async (event: any) => {
  await connectDatabase();

  const postRepo = getRepository(Post)
  const post = await postRepo.find(
      { 
          where: {
              deleted_at: null
          },
          relations: ["user", "user.profile", "comments","tags", "tags.tag", "likes"] });

  
  if(!post) return DeplMsgResponse(404, "post 정보가 없습니다.")
  return DeplResponse(200, post)
}


export const getPost = async (event: any) => {
  await connectDatabase();
  
  const pathParam = event.pathParameters

  const postRepo = getRepository(Post)
  const post = await postRepo.findOne({ 
      where: {
          id: pathParam.post_id,
          deleted_at: null
      },
      relations: ["user", "user.profile", "comments", "comments.comment_user", "comments.comment_user.profile","tags", "tags.tag", "likes", "likes.user", "likes.user.profile"] });

  
  if(!post) return DeplMsgResponse(404, "존재하지 않거나 삭제된 post입니다.")
  return DeplResponse(200, post)
}


export const writePostComment = async (event: any, user_id: string) => {
  await connectDatabase();
  
  const payload = JSON.parse(event.body);
  try {
      const commentRepo = getRepository(PostComment)
      const postRepo = getRepository(Post)

      const post = await postRepo.findOne({
          where: {
              id: payload.post_id,
              deleted_at: null
          },
      })

      if(!post) return DeplMsgResponse(404, "존재하지 않거나 삭제된 Post입니다.")

      const post_comment = new PostComment();

      post_comment.fk_post_id = payload.post_id
      post_comment.fk_user_id = user_id
      post_comment.text = payload.text

      await commentRepo.save(post_comment);
      
      return DeplMsgResponse(200, "OK")
  } catch (e) {
      console.error(e)
  }
}


export const deletePostComment = async (event: any, user_id: string) => {
  await connectDatabase();
  
  const pathParam = event.pathParameters

  try {
      const commentRepo = getRepository(PostComment)
      const postRepo = getRepository(Post)

      const post = await postRepo.findOne({
          where: {
              id: pathParam.post_id,
              deleted_at: null
          },
      })

      if(!post) return DeplMsgResponse(404, "존재하지 않거나 삭제된 Post입니다.")

      const comment = await commentRepo.findOne({
          where: {
              id : pathParam.comment_id,
              fk_post_id: pathParam.post_id,
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