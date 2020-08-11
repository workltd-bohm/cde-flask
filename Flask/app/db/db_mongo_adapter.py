from pymongo import *
from pymongo.errors import ConnectionFailure
import uuid
from app.model.user import User
from app.model.project import Project


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

    def upload_folder_structure(self, project):
        col = self._db.Projects
        project_query = {'project_name': project.name}
        project_uploaded = False
        if col.find_one(project_query, {'_id': 0}) is None:
            project_id = col.insert_one(project.to_json()).inserted_id
            col.update_one({'project_id': 'default'},
                           {'$set': {'project_id': str(project_id)}})
            project_uploaded = True
        self._close_connection()
        return project_uploaded

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
        project = None
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
                if project.add_ic(file_obj, project.root_ic):
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})
                else:
                    project = None
                    print("dir with the specific path not found")
            else:
                project = None
                print("File already exists in the given path")
        else:
            print("project with the specific ID not found")
        self._close_connection()
        return project

    def create_folder(self, project_name, folder):
        col = self._db.Projects
        project_query = {'project_name': project_name}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)

            if project.add_ic(folder, project.root_ic):
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})
        else:
            print("project with the specific ID not found")
            return False
        self._close_connection()
        return True

    def get_file(self, file_id, file_name):
        col = self._db.Projects.Files
        file_query = {'file_name': file_name}  # {'file_id': file_id, 'file_name': file_name}
        stored_file = col.find_one(file_query, {'_id': 0})
        self._close_connection()
        return stored_file

    def clear_db(self):
        self._db.Projects.drop()
        self._db.Projects.Files.drop()

