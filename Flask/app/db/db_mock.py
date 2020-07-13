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
    def get_user(post_data):
        file = open('db/file_tables/users.txt', 'r')
        data = file.read()
        file.close()
        json_file = json.loads(data)
        user = {'message' : msg.INVALID_USER_PASS}
        for j in json_file:
            if j['email'] == post_data['email'] and j['password'] == post_data['password']:
                user_new = User()
                user_new.id = j['id']
                user_new.create_user(j)
                user = user_new.to_json()
                user['message'] = msg.LOGGED_IN
                break
        return user

    @staticmethod
    def set_user(user):
        file = open('db/file_tables/users.txt', 'r+')
        data = file.read()
        json_file = json.loads(data)
        user_new = {}
        already_in = False
        for j in json_file:
            if j['email'] == user.email:
                already_in = True
                user_new['message'] = msg.USER_ALREADY_IN
                break
        if not already_in:
            user.id = str(uuid.uuid1())
            json_file.append(user.to_json())
            file.seek(0)
            json.dump(json_file, file)
            file.close()
            user_new = user.to_json()
            user_new['message'] = msg.SIGNED_IN
        return user_new
