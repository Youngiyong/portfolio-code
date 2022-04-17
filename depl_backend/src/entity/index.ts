import AdminUser from './AdminUser';
import Post from './Post';
import PostComment from './PostComment';
import PostLike from './PostLike';
import PostTag from './PostTag';
import QnaAggregation from './QnaAggregation';
import QnaComment from './QnaComment';
import QnaLike from './QnaLike';
import Qna from './Qnas';
import QnaTag from './QnaTag';
import SocialAccount from './SocialAccount';
import Tag from './Tag';
import User from './User';
import UserFollow from './UserFollow';
import UserProfile from './UserProfile';

const entities = [
  User,
  UserProfile,
  UserFollow,
  AdminUser,
  SocialAccount,
  QnaTag,
  QnaAggregation,
  QnaLike,
  QnaComment,
  Qna,
  Tag,
  Post,
  PostTag,
  PostComment,
  PostLike
];

export default entities;
