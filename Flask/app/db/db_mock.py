import json


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
        user = ""
        for j in json_file:
            if j['email'] == post_data['email'] and j['password'] == post_data['password']:
                user = j
                break
        return user

    @staticmethod
    def set_user(user):
        with open('file_tables/users.txt', "r+") as file:
            data = json.load(file)
            data.update(user)
            file.seek(0)
            json.dump(data, file)
