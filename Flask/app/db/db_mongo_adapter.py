from pymongo import *
from pymongo.errors import ConnectionFailure
import uuid
from app.model.user import User
from app.model.project import Project
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
        result = col.find_one(identifier, {'_id': 0})
        user = None
        if result:
            user = User()
            user.create_user(result)
            user.id = result['id']
        self._close_connection()
        return user

    def set_user(self, user):
        col = self._db.Users
        user_query = {'email': user.email}
        modified_user = None
        if col.find_one(user_query, {'_id': 0}) is None:
            user.id = str(uuid.uuid1())
            col.insert_one(user.to_json())
            modified_user = user
        self._close_connection()
        return modified_user

    def _close_connection(self):
        self._client.close()

    def upload_folder_structure(self, project, user):
        col = self._db.Projects
        col_roles = self._db.Roles
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

            message = msg.PROJECT_SUCCESSFULLY_ADDED
        self._close_connection()
        return message

    def get_all_projects(self):
        col = self._db.Projects
        project_query = {}
        result = col.find()
        print(result)
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
            file_query = {'file_name': file_obj.name+file_obj.type, "parent": file_obj.parent}
            file_json = col_file.find_one(file_query, {'_id': 0})
            if file_json is None:
                file_obj.stored_id = str(col_file.insert_one({"file_id": "default",
                                                              "file_name": file_obj.name+file_obj.type,
                                                              "parent": file_obj.parent,
                                                              "file": file,
                                                              "description": file_obj.description})
                                         .inserted_id)
                col_file.update_one({'file_id': 'default'},
                                    {'$set': {'file_id': str(file_obj.stored_id)}})
                add = project.add_ic(file_obj, project.root_ic)
                if add == msg.IC_SUCCESSFULLY_ADDED:
                    print(project.to_json())
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
            print(project.to_json())
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
            print(project.to_json())
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

    def get_file(self, file_id, file_name):
        col = self._db.Projects.Files
        file_query = {'file_name': file_name}  # {'file_id': file_id, 'file_name': file_name}
        stored_file = col.find_one(file_query, {'_id': 0})
        self._close_connection()
        return stored_file

    def clear_db(self):
        self._db.Projects.drop()
        self._db.Projects.Files.drop()

