import json
import uuid
from model.user import User
import model.messages as msg


class DBMock:

    @staticmethod
    def connect():
        return ""

    @staticmethod
    def get_file(name):
        file = open('file_tables/' + name, 'r')
        data = file.read()
        file.close()
        return json.loads(data)

    @staticmethod
    def get_user(user):
        file = open('db/file_tables/users.txt', 'r')
        data = file.read()
        file.close()
        json_file = json.loads(data)
        new_user = None
        for j in json_file:
            if j['email'] == user['email'] and j['password'] == user['password']:
                new_user = User()
                new_user.id = j['id']
                new_user.create_user(j)
                break
        return new_user

    @staticmethod
    def set_user(user):
        file = open('db/file_tables/users.txt', 'r+')
        data = file.read()
        json_file = json.loads(data)
        already_in = False
        for j in json_file:
            if j['email'] == user.email:
                already_in = True
                user = None
                break
        if not already_in:
            user.id = str(uuid.uuid1())
            json_file.append(user.to_json())
            file.seek(0)
            json.dump(json_file, file)
            file.close()
        return user
