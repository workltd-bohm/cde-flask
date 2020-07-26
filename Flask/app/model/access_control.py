class AccessControl:

    def __init__(self, project_id):
        self._project_id = project_id
        self._users = []

    @property
    def users(self):
        return self._users

    @users.setter
    def users(self, value):
        self._users = value

    def add_user(self, user):
        self._users.append(user)

    def remove_user(self, user):
        self._users.remove(user)