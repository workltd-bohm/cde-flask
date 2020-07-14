from pymongo import *
from pymongo.errors import ConnectionFailure
import uuid
from model.user import User


class DBMongoAdapter:

    def __init__(self):
        self._db = None

    def connect(self):
        try:
            client = MongoClient('localhost:27017')
            self._db = client.slDB
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
        return user

    def set_user(self, user):
        col = self._db.Users
        user_query = {'email': user.email}
        modified_user = None
        if col.find_one(user_query, {'_id': 0}) is None:
            user.id = str(uuid.uuid1())
            col.insert_one(user.to_json())
            modified_user = user
        return modified_user
