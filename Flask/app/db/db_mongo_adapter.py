from pymongo import *
from pymongo.errors import ConnectionFailure
import uuid
from app.model.user import User
from app.model.project import Project
from app.model.marketplace.post import Post
from app.model.marketplace.bid import Bid
from app.model.role import Role
import app.model.messages as msg


class DBMongoAdapter:

    def __init__(self):
        self._db = None

    def connect(self):
        try:
            self._client = MongoClient('localhost:27017')
            self._db = self._client.slDB
        except ConnectionFailure(message='', error_labels=None):
            return False
        return True

    def get_user(self, identifier):
        col = self._db.Users
        message = msg.INVALID_USER_PASS
        user = None
        print(identifier)
        result = col.find_one(identifier, {'_id': 0})
        if result:
            if not result['confirmed']:
                message = msg.MESSAGE_SENT_TO_ADMIN
            else:
                # user = User()
                # user.create_user(result)
                # user.id = result['id']
                # user.confirmed = result['confirmed']
                user = result
                message = msg.LOGGED_IN
        self._close_connection()
        return message, user

    def set_user(self, user):
        col = self._db.Users
        user_query = {'email': user.email}
        modified_user = None
        message = msg.USER_ALREADY_IN
        if col.find_one(user_query, {'_id': 0}) is None:
            user.id = str(uuid.uuid1())
            user.confirmed = False
            col.insert_one(user.to_json())
            modified_user = user
            message = msg.MESSAGE_SENT_TO_ADMIN
        self._close_connection()
        return message, modified_user

    def edit_user(self, user_json):
        col = self._db.Users
        user_query = {'id': user_json["id"]}
        message = msg.USER_NOT_FOUND
        if col.find_one(user_query, {'_id': 0}):
            col.update_one(user_query, {'$set': user_json})
            message = msg.ACCOUNT_CHANGED
        self._close_connection()
        return message

    def confirm_account(self, user):
        col = self._db.Users
        message = msg.USER_NOT_FOUND
        if col.find_one(user, {'_id': 0}):
            col.update_one(user, {'$set': {'confirmed': True}})
            message = msg.ACCOUNT_CONFIRMED
        self._close_connection()
        return message

    def _close_connection(self):
        self._client.close()

    def upload_folder_structure(self, project, user):
        col = self._db.Projects
        col_roles = self._db.Roles
        col_users = self._db.Users.Roles
        project_query = {'project_name': project.name}
        message = msg.PROJECT_ALREADY_EXISTS
        if col.find_one(project_query, {'_id': 0}) is None:
            project_id = col.insert_one(project.to_json()).inserted_id
            col.update_one({'project_id': 'default'},
                           {'$set': {'project_id': str(project_id)}})
            role_query = {'project_id': project_id}
            role = col_roles.find_one(role_query, {'_id': 0})
            if not role:
                role = {}
                role['project_id'] = project_id
                role['user'] = [user]
                col_roles.insert_one(role)
            else:
                role['user'].append(user)
                col_roles.update_one({'project_id': project_id}, {'$set': role})

            user_query = {'user_id': user['id']}
            u = col_users.find_one(user_query, {'_id': 0})
            if not u:
                u = {}
                u['projects'] = [{'project_id': str(project_id), 'role': Role.OWNER.value}]
                u['user_id'] = user['id']
                col_users.insert_one(u)
            else:
                # u_json = json.loads(u)
                u['projects'].append({'project_id': str(project_id), 'role': Role.OWNER.value})
                col_users.update_one(user_query,
                               {'$set': u})

            message = msg.PROJECT_SUCCESSFULLY_ADDED
        self._close_connection()
        return message

    def get_all_projects(self):
        col = self._db.Projects
        result = col.find()
        # print(result)
        self._close_connection()
        return result

    def get_my_projects(self, user):
        col_users = self._db.Users.Roles
        user_query = {'user_id': user['id']}
        result = col_users.find_one(user_query, {'_id': 0})
        projects = []
        if result:
            for pr in result['projects']:
                projects.append(self.get_my_project(pr['project_id']))
        self._close_connection()
        return projects

    def get_my_project(self, project_id):
        col = self._db.Projects
        project_query = {'project_id': project_id}
        result = col.find_one(project_query, {'_id': 0})
        self._close_connection()
        return result

    def get_project(self, project_name, user):
        col = self._db.Projects
        project_query = {'project_name': project_name}
        result = col.find_one(project_query, {'_id': 0})
        self._close_connection()
        return result

    def update_file(self, project, file_obj, file):
        col = self._db.Projects
        col_file = self._db.Projects.Files
        project_query = {'project_id': project.project_id, 'stored_id': file_obj.stored_id}
        project_uploaded = False
        if col.find_one(project_query, {'_id': 0}) is None:
            file_obj.stored_id = str(col_file.insert_one({"file_id": "default",
                                                          "file_name": file_obj.name,
                                                          "file": file,
                                                          "description": file_obj.description})
                                     .inserted_id)
            col.update_one({'file_id': 'default'},
                           {'$set': {'file_id': str(file_obj.stored_id)}})
            # print(file_obj.to_json())
            project.update_file(file_obj)
            # print(project.to_json())
            col_file.update_one({'project_name': project.name}, {'$set': project.to_json()})
            project_uploaded = True
        self._close_connection()
        return project_uploaded

    def upload_file(self, project_name, file_obj, file):
        col = self._db.Projects
        col_file = self._db.Projects.Files
        project_query = {'project_name': project_name}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            file_query = {'file_name': file_obj.name+file_obj.type, "parent_id": file_obj.parent_id}
            file_json = col_file.find_one(file_query, {'_id': 0})
            if file_json is None:
                file_obj.stored_id = str(col_file.insert_one({"file_id": "default",
                                                              "file_name": file_obj.name+file_obj.type,
                                                              "parent": file_obj.parent,
                                                              "parent_id": file_obj.parent_id,
                                                              "file": file,
                                                              "description": file_obj.description})
                                         .inserted_id)
                col_file.update_one({'file_id': 'default'},
                                    {'$set': {'file_id': str(file_obj.stored_id)}})
                add = project.add_ic(file_obj, project.root_ic)
                if add == msg.IC_SUCCESSFULLY_ADDED:
                    # print(project.to_json())
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})
            else:
                print(msg.IC_ALREADY_EXISTS)
                return msg.IC_ALREADY_EXISTS
        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return add

    def create_folder(self, project_name, folder):
        col = self._db.Projects
        project_query = {'project_name': project_name}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)

            add = project.add_ic(folder, project.root_ic)
            if add == msg.IC_SUCCESSFULLY_ADDED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})
        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return add

    def rename_ic(self, request_data):
        col = self._db.Projects
        col_file = self._db.Projects.Files
        project_query = {'project_name': request_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            # print(project.to_json())
            add = project.rename_ic(request_data, project.root_ic)
            if add == msg.IC_SUCCESSFULLY_RENAMED:
                file_updated = True
                if not request_data['is_directory']:
                    file_updated = False
                    file_query = {'file_name': request_data['old_name']}
                    file_json = col_file.find_one(file_query, {'_id': 0})
                    if file_json:
                        col_file.update_one({'file_name': request_data['old_name']},
                                            {'$set': {'file_name': str(request_data['new_name'])}})
                        file_updated = True
                    else:
                        print(msg.STORED_FILE_NOT_FOUND)
                        return msg.STORED_FILE_NOT_FOUND
                if file_updated:
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})

        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return add

    def delete_ic(self, delete_ic_data):
        col = self._db.Projects
        col_file = self._db.Projects.Files
        project_query = {'project_name': delete_ic_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            # print(project.to_json())
            delete = project.delete_ic(delete_ic_data, project.root_ic)
            if delete == msg.IC_SUCCESSFULLY_DELETED:
                ic_deleted = True
                if not delete_ic_data['is_directory']:
                    ic_deleted = False
                    file_query = {'file_name': delete_ic_data['delete_name']}
                    file_json = col_file.delete_one(file_query, {'_id': 0})
                    if file_json:
                        ic_deleted = True
                    else:
                        print(msg.STORED_FILE_NOT_FOUND)
                        return msg.STORED_FILE_NOT_FOUND
                if ic_deleted:
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})

        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return delete

    def get_file(self, file_name):
        col = self._db.Projects.Files
        file_query = {'file_name': file_name}  # {'file_id': file_id, 'file_name': file_name}
        stored_file = col.find_one(file_query, {'_id': 0})
        self._close_connection()
        return stored_file

    def get_post_file(self, request_json):
        col = self._db.Marketplace.Posts.Files
        file_query = request_json
        stored_file = col.find_one(file_query, {'_id': 0})
        self._close_connection()
        return stored_file

    def change_color(self, file_obj):
        col = self._db.Projects
        project_query = {'project_name': file_obj["project_name"]}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            add = project.change_color(file_obj, project.root_ic)
            if add == msg.IC_COLOR_CHANGED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})
            else:
                print(msg.DEFAULT_ERROR)
                return msg.DEFAULT_ERROR
        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return add

    def create_post(self, request_json):
        col = self._db.Marketplace.Posts
        posts_query = {'post_id': request_json['post_id']}
        message = msg.POST_ALREADY_EXISTS
        post_id = ''
        if col.find_one(posts_query, {'_id': 0}) is None:
            post_id = col.insert_one(request_json).inserted_id
            col.update_one({'post_id': 'default'},
                           {'$set': {'post_id': str(post_id)}})
            message = msg.POST_CREATED
            print(Post.json_to_obj(request_json).product.name)
        self._close_connection()
        return message, str(post_id)

    def get_all_posts(self):
        col = self._db.Marketplace.Posts
        result = col.find()
        res = []
        for doc in result:
            doc.pop('_id', None)
            doc.pop('bids', None)
            doc.pop('current_best_bid', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_my_posts(self, user):
        col = self._db.Marketplace.Posts
        post_query = {'user_owner': user}
        result = col.find(post_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def upload_post_file(self, request_json, file):
        col = self._db.Marketplace.Posts.Files
        # file_query = {'file_name': request_json['file_name']}
        # file_json = col.find_one(file_query, {'_id': 0})
        # if file_json is None:
        stored_id = str(col.insert_one({"file_id": "default",
                                        "post_id": request_json['user'],
                                        "file_name": request_json['file_name'],
                                        "file": file,}).inserted_id)
        col.update_one({'file_id': 'default'},
                                    {'$set': {'file_id': str(stored_id)}})
        message = msg.IC_SUCCESSFULLY_ADDED

        self._close_connection()
        return message, str(stored_id)

    def update_post_file(self, file, post_id, user):
        col = self._db.Marketplace.Posts.Files
        file_query = {'file_name': file, 'post_id': user['username']}
        col.update_one(file_query,
                       {'$set': {'post_id': post_id}})
        message = msg.IC_SUCCESSFULLY_ADDED
        return message

    def create_bid(self, request_json):
        col = self._db.Marketplace.Bids
        col_post = self._db.Marketplace.Posts
        bid_query = {'bid_id': request_json['bid_id']}
        message = msg.BID_ALREADY_EXISTS
        if col.find_one(bid_query, {'_id': 0}) is None:
            bid_id = col.insert_one(request_json).inserted_id
            col.update_one({'bid_id': 'default'},
                           {'$set': {'bid_id': str(bid_id)}})
            message = msg.BID_CREATED
            print(Bid.json_to_obj(request_json))
            post_query = {'post_id': request_json['post_id']}
            post = col_post.find_one(post_query, {'_id': 0})
            if post:
                post['bids'].append(str(bid_id))
                col_post.update_one(post_query,
                               {'$set': post})
        self._close_connection()
        return message

    def get_all_bids(self):
        col = self._db.Marketplace.Bids
        result = col.find()
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_my_bids(self, user):
        col = self._db.Marketplace.Bids
        bid_query = {'user': user}
        result = col.find(bid_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_single_post(self, request_json):
        col = self._db.Marketplace.Posts
        bid_post_query = {'post_id': request_json['post_id']}
        result = col.find(bid_post_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_single_bid(self, request_json):
        col = self._db.Marketplace.Bids
        bid_post_query = {'bid_id': request_json['bid_id']}
        result = col.find(bid_post_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_bids_for_post(self, request_json):
        col = self._db.Marketplace.Bids
        post_query = {'post_id': request_json['post_id']}
        result = col.find(post_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def share_project(self, request_data, user):
        col_users = self._db.Users.Roles
        col = self._db.Users
        # TODO: check does user has the rights to share
        user_query = {'username': request_data['user_name']}
        result = col.find_one(user_query, {'_id': 0})
        message = msg.DEFAULT_ERROR
        if result:
            user_id = result['id']
            user_query = {'user_id': user_id}
            u = col_users.find_one(user_query, {'_id': 0})
            u['projects'].append({'project_id': request_data['project_id'],
                                  'role': getattr(Role, request_data['role']).value})
            col_users.update_one(user_query,
                                 {'$set': u})
            message = msg.SUCCESSFULLY_SHARED

        else:
            message = msg.USER_NOT_FOUND
        self._close_connection()
        return message

    def clear_db(self):
        self._db.Projects.drop()
        self._db.Projects.Files.drop()
        self._db.Marketplace.Posts.drop()
        self._db.Marketplace.Bids.drop()
        self._db.Roles.drop()
        self._db.Users.Roles.drop()
        self._db.Marketplace.Posts.Files.drop()
        # self._db.Users.drop()

        col_users = self._db.Users.Roles
        col = self._db.Users
        # TODO: check does user has the rights to share
        result = col.find()
        for user in result:
            user_query = {'user_id': user['id']}
            u = col_users.find_one(user_query, {'_id': 0})
            if not u:
                u = {}
                u['projects'] = []
                u['user_id'] = user['id']
                col_users.insert_one(u)


